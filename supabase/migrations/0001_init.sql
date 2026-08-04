-- Justicia Cerca — schema inicial (ver docs/SDD.md §4)

create extension if not exists postgis;

create type age_mode as enum ('CHILD', 'ADULT', 'ELDER');
create type professional_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type booking_status as enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
create type slot_modality as enum ('VISIT', 'VOICE', 'VIDEO');
create type consent_status as enum ('PENDING', 'APPROVED', 'DENIED');
create type topic_status as enum ('OPEN', 'LOCKED', 'HIDDEN');
create type target_type as enum ('PAGE', 'SPECIALISTS_FILTER', 'FORUM_TOPIC', 'PROFILE');
create type message_role as enum ('user', 'assistant');

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null,
  birth_date      date not null,
  age_mode        age_mode not null,
  avatar_url      text,
  phone           text,
  language        text not null default 'es',
  is_professional boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.guardian_links (
  id              uuid primary key default gen_random_uuid(),
  guardian_id     uuid not null references public.profiles(id) on delete cascade,
  child_id        uuid not null references public.profiles(id) on delete cascade,
  relationship    text,
  consent_status  consent_status not null default 'PENDING',
  consented_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (guardian_id, child_id)
);

create table public.professional_profiles (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid unique not null references public.profiles(id) on delete cascade,
  headline          text,
  bio               text,
  experience_years  int check (experience_years >= 0),
  city              text,
  lat               double precision,
  lng               double precision,
  cv_url            text,
  status            professional_status not null default 'PENDING',
  rejection_reason  text,
  admin_reviewed_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.professional_roles (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  name_i18n jsonb not null
);

create table public.specialties (
  id        uuid primary key default gen_random_uuid(),
  role_id   uuid references public.professional_roles(id) on delete cascade,
  slug      text not null,
  name_i18n jsonb not null,
  unique (role_id, slug)
);

create table public.languages (
  id        uuid primary key default gen_random_uuid(),
  code      text unique not null,
  name_i18n jsonb not null
);

create table public.professional_roles_x (
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  role_id         uuid not null references public.professional_roles(id) on delete cascade,
  primary key (professional_id, role_id)
);
create table public.professional_specialties (
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  specialty_id    uuid not null references public.specialties(id) on delete cascade,
  primary key (professional_id, specialty_id)
);
create table public.professional_languages (
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  language_id     uuid not null references public.languages(id) on delete cascade,
  primary key (professional_id, language_id)
);

create table public.availability_slots (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  modality        slot_modality not null,
  is_booked       boolean not null default false,
  check (ends_at > starts_at)
);

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  slot_id         uuid unique not null references public.availability_slots(id),
  modality        slot_modality not null,
  status          booking_status not null default 'PENDING',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.forum_topics (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text not null,
  status     topic_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.forum_posts (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid not null references public.forum_topics(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  parent_id  uuid references public.forum_posts(id) on delete cascade,
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('TOPIC','POST')),
  target_id   uuid not null,
  reason      text,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.faq_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  label_i18n jsonb not null,
  sort_order int not null default 0,
  active     boolean not null default true
);
create table public.faq_items (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.faq_categories(id) on delete cascade,
  question_i18n jsonb not null,
  answer_i18n   jsonb not null,
  keywords      text[] not null default '{}',
  target_type   target_type not null,
  target_id     text,
  age_mode      age_mode,
  active        boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  role        message_role not null,
  content     text not null,
  faq_item_id uuid references public.faq_items(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index on public.professional_profiles (status) where status = 'APPROVED';
create index on public.availability_slots (professional_id, starts_at) where not is_booked;
create index on public.bookings (client_id);
create index on public.faq_items (active, age_mode);

-- Función de derivación de edad (SRS RF-1.3 / SDD §5.1)
create or replace function public.derive_age_mode(birth date)
returns age_mode language sql immutable as $$
  select case
    when (extract(year from age(birth)))::int <= 12 then 'CHILD'::age_mode
    when (extract(year from age(birth)))::int <= 64 then 'ADULT'::age_mode
    else 'ELDER'::age_mode
  end
$$;

-- Trigger: crear perfil tras el signup y sincronizar age_mode
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, birth_date, age_mode)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Usuario'),
    coalesce((new.raw_user_meta_data ->> 'birth_date')::date, current_date),
    public.derive_age_mode(coalesce((new.raw_user_meta_data ->> 'birth_date')::date, current_date))
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.sync_age_mode()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.age_mode := public.derive_age_mode(new.birth_date);
  return new;
end $$;

create trigger trg_sync_age_mode
  before insert or update of birth_date on public.profiles
  for each row execute function public.sync_age_mode();

-- RLS
alter table public.profiles enable row level security;
alter table public.guardian_links enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
alter table public.reports enable row level security;
alter table public.faq_categories enable row level security;
alter table public.faq_items enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create policy "own profile select" on public.profiles
  for select using (auth.uid() = id or exists (
    select 1 from public.guardian_links g where g.child_id = id and g.consent_status = 'APPROVED'
  ));
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

create policy "approved profiles readable" on public.professional_profiles
  for select using (status = 'APPROVED' or profile_id = auth.uid());
create policy "own application write" on public.professional_profiles
  for insert with check (profile_id = auth.uid());
create policy "own application update" on public.professional_profiles
  for update using (profile_id = auth.uid());

create policy "public slots read" on public.availability_slots
  for select using (is_booked = false and starts_at > now());

create policy "participants read bookings" on public.bookings
  for select using (client_id = auth.uid() or professional_id in (
    select id from public.professional_profiles where profile_id = auth.uid()
  ));

create policy "faq read" on public.faq_items for select using (active);
create policy "faq read cats" on public.faq_categories for select using (active);

create policy "forum public read" on public.forum_topics
  for select using (status <> 'HIDDEN');
create policy "forum post read" on public.forum_posts
  for select using (not hidden);
create policy "forum authed write" on public.forum_topics
  for insert with check (auth.uid() = author_id);

-- Seed del catálogo de idiomas
insert into public.languages (code, name_i18n) values
  ('es', '{"es":"Español","en":"Spanish"}'),
  ('qu', '{"es":"Quechua","en":"Quechua"}'),
  ('gn', '{"es":"Guaraní","en":"Guaraní"}'),
  ('en', '{"es":"Inglés","en":"English"}'),
  ('lsa', '{"es":"Lengua de señas (LSA)","en":"Sign language (LSA)"}');
