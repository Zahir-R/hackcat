# Documento de Diseño de Software (SDD)

**Proyecto:** Plataforma de Acceso a la Justicia — "Justicia Cerca"
**Referencia de requisitos:** `docs/SRS.md`
**Estado:** Borrador v1.0

---

## 1. Introducción

### 1.1 Propósito

Este documento describe el diseño técnico de la PWA "Justicia Cerca": arquitectura, estructura del proyecto, modelo de datos físico (SQL + RLS), y **toda la lógica de negocio** (modos por edad, tutela, aprobación de profesionales, búsqueda geográfica, reservas, emergencias, foro y el chatbot determinista Ramon). Implementa los requisitos de `docs/SRS.md` sobre el stack: **Nuxt 4 (Vue 3) + Supabase (Auth, Postgres/PostGIS, Storage, Edge Functions) + Leaflet/OSM**.

### 1.2 Decisiones de diseño clave

| Decisión | Justificación |
|---|---|
| **Sin LLM / sin RAG** | Costo cero, respuestas deterministas e instantáneas; el chatbot Ramon es un motor de FAQ curado (SRS RF-7) |
| **Backend SaaS (Supabase)** | Free-tier, auth + DB + storage + RLS integrados; velocidad de desarrollo para la hackathon |
| **PostGIS para geolocalización** | Búsqueda de proximidad nativa en SQL (haversine/`earthdistance`) |
| **Reservas en Edge Functions** | Aislamiento transaccional para evitar doble reserva (SRS RF-4.3) |
| **PWA CSR estática** | Despliegue gratuito en CDN (Vercel/Netlify/Cloudflare), offline parcial |

---

## 2. Arquitectura

### 2.1 Diagrama de componentes

```text
┌────────────────────────── CLIENTE (Nuxt 4 / PWA CSR) ──────────────────────────┐
│ app/                                                                           │
│  pages/  index | mapa | especialistas | comunidad | emergencias | perfil | admin│
│  components/ (NavBar, ProfileScroller, SpecialistCard, MapLeaflet, ChatRamon…) │
│  composables/ (useAuth, useAgeMode, useGeolocation, useBookings, useFaq, …)   │
│  i18n/ es|qu|gn|en                                                             │
│  stores/ (ageMode, sesión, Ramon)                                              │
│  middleware/ (auth, guardian, admin, ageMode)                                  │
└───────────────┬────────────────────────────────────────────┬───────────────────┘
                │ REST + sesión JWT                          │ fetch (geolocalización)
                ▼                                            ▼
┌─────────────────────────── SUPABASE ───────────────────────┐   OSM Tile Server
│ Auth (email/password, tutores)                             │        │
│ Postgres + PostGIS (RLS activo)  ◄──── Edge Functions      │        ▼
│ Storage (CVs, avatares)             (reservas, admin)      │   Leaflet (cliente)
└────────────────────────────────────────────────────────────┘

server/ (Nitro)
  api/faq/[id].get.ts        → sirve FAQ (consulta RLS + filtro age_mode/i18n)
  api/specialists.get.ts     → búsqueda geográfica con filtros combinados
  api/availability/*.ts      → lectura de franjas públicas
  middleware/                → logging / rate limiting
```

### 2.2 Flujo de datos por módulo

- **Auth/Perfiles:** Supabase Auth (sesión JWT) + tabla `profiles` sincronizada por trigger; `age_mode` derivado por función DB (no editable).
- **Búsqueda:** `server/api/specialists.get.ts` ejecuta una query con PostGIS + filtros; Leaflet dibuja marcadores.
- **Reservas:** Edge Function transaccional (bloquea la franja con `UPDATE ... WHERE is_booked=false` retornando afectadas=1).
- **Ramon:** datos de FAQ cacheados en el cliente (SW) → matching local determinista → render de respuesta + enlace.

---

## 3. Estructura del Proyecto (Nuxt 4)

> Nuxt 4 usa el directorio `app/` (no raíz). `pages/`, `components/`, `composables/`, `middleware/` viven dentro de `app/`.

```text
app/
  app.vue
  pages/
    index.vue                 # Inicio (dashboard según age_mode)
    mapa.vue                  # Mapa Leaflet con filtros
    especialistas.vue         # Lista de profesionales cercanos
    especialistas/[id].vue    # Perfil profesional + botón reservar
    comunidad.vue             # Lista de temas
    comunidad/[topic].vue     # Tema + respuestas
    emergencias.vue           # Botones tel: 110/119/118
    chat.vue                  # Página (opcional) y widget Ramon
    auth/login.vue, auth/register.vue, auth/guardian.vue
    perfil/index.vue          # Mi perfil
    perfil/profesional.vue    # Perfil profesional (CV, roles, agenda)
    admin/index.vue           # Panel admin (aprobaciones, foro, FAQ)
  components/                 # NavBar, ProfileScroller, MapLeaflet, ChatRamon, ...
  composables/                # useAuth, useAgeMode, useGeolocation, useBookings, useFaq
  middleware/                 # auth.global, guardian.ts, admin.ts
  i18n/                       # es.ts, qu.ts, gn.ts, en.ts
  stores/                     # Pinia: auth, ageMode, ramon
server/
  api/
    specialists.get.ts
    faq/[id].get.ts
    availability/[profId].get.ts
    admin/faq.post.ts, admin/faq.patch.ts, admin/faq.delete.ts
    admin/specialists.approve.ts
    admin/forum.review.ts
  middleware/rate-limit.ts
supabase/
  migrations/*.sql            # esquema + RLS + triggers
  functions/reserve-booking.ts
  functions/approve-specialist.ts
```

---

## 4. Modelo de Datos Físico (SQL + RLS)

### 4.1 Tipos enumerados

```sql
create type age_mode as enum ('CHILD', 'ADULT', 'ELDER');
create type professional_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type booking_status as enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
create type slot_modality as enum ('VISIT', 'VOICE', 'VIDEO');
create type consent_status as enum ('PENDING', 'APPROVED', 'DENIED');
create type topic_status as enum ('OPEN', 'LOCKED', 'HIDDEN');
create type target_type as enum ('PAGE', 'SPECIALISTS_FILTER', 'FORUM_TOPIC', 'PROFILE');
create type message_role as enum ('user', 'assistant');
```

### 4.2 Tablas

```sql
-- Perfiles de ciudadano (1:1 con auth.users)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  birth_date    date not null,
  age_mode      age_mode not null,          -- mantenido por trigger, no editable
  avatar_url    text,
  phone         text,
  language      text not null default 'es', -- es|qu|gn|en
  is_professional boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Vínculo tutor–menor (menores 0–12)
create table public.guardian_links (
  id              uuid primary key default gen_random_uuid(),
  guardian_id     uuid not null references public.profiles(id) on delete cascade,
  child_id        uuid not null references public.profiles(id) on delete cascade,
  relationship    text,                     -- padre/madre/tutor legal...
  consent_status  consent_status not null default 'PENDING',
  consented_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (guardian_id, child_id)
);

-- Perfil profesional (1:1 con profiles; solo si is_professional)
create table public.professional_profiles (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid unique not null references public.profiles(id) on delete cascade,
  headline          text,
  bio               text,
  experience_years  int check (experience_years >= 0),
  city              text,
  lat               double precision,       -- geolocalización
  lng               double precision,
  cv_url            text,                   -- Supabase Storage path (acceso restringido)
  status            professional_status not null default 'PENDING',
  rejection_reason  text,
  admin_reviewed_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Catálogos (multi-profesión auto-asignados)
create table public.professional_roles (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,           -- abogado|psicologo|trabajador_social|traductor|paralegal
  name_i18n jsonb not null                  -- {"es":"Abogado","qu":"...","gn":"...","en":"Lawyer"}
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
  code      text unique not null,           -- es|qu|gn|en|lsa (lengua de señas boliviana)
  name_i18n jsonb not null
);

-- N:M profesional ↔ rol / especialidad / idioma
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

-- Franjas de disponibilidad
create table public.availability_slots (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  modality        slot_modality not null,
  is_booked       boolean not null default false,
  check (ends_at > starts_at),
  check (is_booked = false or exists (select 1 from public.bookings b where b.slot_id = id))
);

-- Reservas
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  slot_id         uuid unique not null references public.availability_slots(id),  -- unique ⇒ no doble reserva
  modality        slot_modality not null,
  status          booking_status not null default 'PENDING',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Foro
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
  parent_id  uuid references public.forum_posts(id) on delete cascade,  -- respuestas anidadas
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.reports (
  id         uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('TOPIC','POST')),
  target_id   uuid not null,
  reason      text,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- FAQ de Ramon (determinista)
create table public.faq_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  label_i18n jsonb not null,
  sort_order int not null default 0,
  active     boolean not null default true
);
create table public.faq_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.faq_categories(id) on delete cascade,
  question_i18n jsonb not null,             -- {"es":"...","qu":"...","gn":"...","en":"..."}
  answer_i18n  jsonb not null,
  keywords     text[] not null default '{}',-- aliases normalizados para matching
  target_type  target_type not null,
  target_id    text,                        -- ruta/ID según target_type
  age_mode     age_mode not null default 'ALL'::age_mode,  -- CHILD|ADULT|ELDER|ALL
  active       boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Registro de conversaciones con Ramon
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

-- Índices
create index on public.professional_profiles (status) where status = 'APPROVED';
create index on public.availability_slots (professional_id, starts_at) where not is_booked;
create index on public.bookings (client_id);
create index on public.faq_items (active, age_mode);
```

### 4.3 RLS (Row-Level Security)

Regla general: **todo acceso pasa por RLS**; el cliente nunca habla con la BD fuera de políticas.

| Tabla | Política |
|---|---|
| `profiles` | `SELECT` propio, tutores aprobados y admins; `INSERT` propio (via trigger post-signup); `UPDATE` propio o tutor; menor no edita `birth_date` sin tutor |
| `guardian_links` | `SELECT`/`INSERT` tutor y admins; consentimiento actualizable por tutor |
| `professional_profiles` | `SELECT` público solo `status='APPROVED'` (excepto dueño/admin); `INSERT`/`UPDATE` dueño; CV (`cv_url`) legible solo por dueño/admin |
| `availability_slots` | `SELECT` público (solo franjas futuras no reservadas); escritura del profesional dueño |
| `bookings` | `SELECT` participante (cliente o profesional) y admin; `INSERT` cliente; escritura transaccional vía **Edge Function** |
| `forum_topics` / `forum_posts` | `SELECT` público salvo `HIDDEN`/`hidden`; `INSERT` autenticado; `UPDATE`/`DELETE` autor o admin; ocultar/borrar solo admin |
| `faq_categories` / `faq_items` | `SELECT` público (activos); escritura solo admin |
| `chat_sessions` / `chat_messages` | `SELECT`/`INSERT` del dueño de la sesión |

---

## 5. Lógica de Negocio (todas las reglas)

### 5.1 Derivación de modo por edad

```ts
// composables/useAgeMode.ts
const AGE_BOUNDARIES = { CHILD_MAX: 12, ADULT_MAX: 64 }
export function deriveAgeMode(birthDate: string): AgeMode {
  const age = ageInYears(new Date(birthDate))
  if (age <= AGE_BOUNDARIES.CHILD_MAX) return 'CHILD'
  if (age <= AGE_BOUNDARIES.ADULT_MAX) return 'ADULT'
  return 'ELDER'
}
```

- Trigger en DB mantiene `profiles.age_mode` sincronizado ante `INSERT`/`UPDATE` de `birth_date`.
- `age_mode` no es editable por el usuario; solo cambia por la re-derivación (SRS UC-12).

### 5.2 Flujo de tutela (menores)

- Regla: un perfil `CHILD` requiere ≥1 `guardian_links` `APPROVED` para: hacer reservas, publicar en el foro o editar datos sensibles.
- Middleware `guardian.ts`: si `age_mode === 'CHILD'` y no hay tutor aprobado → redirigir a `auth/guardian.vue`.
- El tutor crea el perfil del menor con su sesión (`INSERT` de `profiles` con `age_mode='CHILD'` permitido para el tutor vía RLS).
- Al cambiar la edad a adulto (>12), el vínculo de tutela se desactiva (se conserva el registro).

### 5.3 Aprobación de profesionales (máquina de estados)

```text
             enviar solicitud       aprobar         completar?
   ┌──────────────────────┐   ┌───────────────┐
   ▼                      ▼   ▼               ▼
 (ninguno) ──────────► PENDING ───────► APPROVED
                         │   ▲                │
           rechazar con  │   │  reenviar      │
           motivo        ▼   │  (corrección)  │
                      REJECTED ───────────────┘
```

- `PENDING`: invisible públicamente (RLS).
- `APPROVED`: visible en mapa/lista; habilita franjas y reservas.
- `REJECTED`: dueño edita y reenvía → vuelve a `PENDING`.
- Edge Function `approve-specialist` valida rol admin, actualiza estado y envía email.

### 5.4 Búsqueda geográfica con filtros combinados

```sql
-- server/api/specialists.get.ts (fragmento)
select pp.*, p.display_name,
       st_distance(point(pp.lng, pp.lat)::geography,
                   point($lng, $lat)::geography) / 1000 as distance_km
from professional_profiles pp
join profiles p on p.id = pp.profile_id
left join professional_languages pl on pl.professional_id = pp.id
left join professional_specialties ps on ps.professional_id = pp.id
where pp.status = 'APPROVED'
  and ($langs::uuid[] is null or pl.language_id = any($langs))
  and ($spec::uuid is null or ps.specialty_id = $spec)
  and pp.experience_years >= coalesce($minExp, 0)
  and st_distance(point(pp.lng, pp.lat)::geography, point($lng,$lat)::geography) <= $radiusKm * 1000
group by pp.id, p.display_name
order by distance_km
```

- Distancia por **haversine/PostGIS**; `distance_km` se usa para ordenar y para el badge "a X km".
- Geolocalización: `navigator.geolocation.getCurrentPosition` con consentimiento; fallback a ciudad por defecto (Sucre).
- Filtros combinados: idiomas (incluye `lsa`), rol, especialidad, experiencia mínima, radio.

### 5.5 Reservas (transaccional, sin doble reserva)

Edge Function `reserve-booking` (aislamiento):

```ts
const { data: slot } = await supabase
  .from('availability_slots')
  .update({ is_booked: true })
  .eq('id', slotId)
  .eq('is_booked', false)      // condición atómica
  .select('*')
  .single()
if (!slot) return conflict()   // franja ya tomada → error de concurrencia

await supabase.from('bookings').insert({
  client_id, professional_id, slot_id, modality, status: 'PENDING',
})
```

Máquina de estados de la reserva:

```text
 PENDING ──confirmar──► CONFIRMED ──completar (profesional)──► COMPLETED
    │                      │
    └─────cancelar─────────┴────────► CANCELLED   (libera la franja: is_booked=false)
```

- El ciudadano cancela solo mientras `PENDING|CONFIRMED`; el profesional confirma/rechaza `PENDING`.
- Zona horaria: las franjas se guardan en `timestamptz`; la UI las muestra con `Intl.DateTimeFormat` en el TZ del usuario.
- Emails: verificación, aprobación/rechazo de profesional, confirmación/cancelación de reserva (Supabase Edge Functions + SMTP).

### 5.6 Emergencias

- Página estática; cada botón es un enlace `tel:`:
  - Policía → `tel:110`
  - Bomberos → `tel:119`
  - Emergencias médicas → `tel:118`
- Confirmación modal antes de iniciar la llamada; información local (SLIM, FELCV, Fiscalía, Defensoría) como tarjetas de referencia.

### 5.7 Chatbot "Ramon" (determinista, sin LLM)

#### 5.7.1 Fuente de datos

- `faq_categories` + `faq_items`, traducidos (`*_i18n jsonb`), restringidos por `age_mode` (`CHILD|ADULT|ELDER|ALL`) y `active`.
- Al iniciar la app, el cliente descarga los ítems activos de su modo + idioma y los cachea (Service Worker) → **matching 100% local**.

#### 5.7.2 Flujo conversacional

```text
 Abrir widget ─► mostrar menú de categorías (botones)
                      │
   ┌──────────────────┼─────────────────────┐
 seleccionar pregunta │  o escribir texto libre
   ▼                  ▼
 respuesta curada + enlace →  normalizar (lowercase, sin diacríticos)
   relacionado          │            ▼
                        │      tokenizar consulta
                        │            ▼
                        │      scoring vs keywords+question
                        │            ▼
                        │   score ≥ umbral ? ──sí──► respuesta + enlace
                        │            │no
                        │            ▼
                        │   fallback "No entendí" + re-muestro menú
```

#### 5.7.3 Algoritmo de matching (determinista)

```ts
// composables/useFaq.ts
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function matchFaq(query: string, items: FaqItem[]): FaqItem | null {
  const qTokens = new Set(normalize(query).split(/\s+/).filter(Boolean))
  let best: FaqItem | null = null
  let bestScore = 0
  for (const item of items) {
    const corpus = [normalize(item.question_i18n[lang]), ...item.keywords.map(normalize)]
    const tokens = new Set(corpus.flatMap(k => k.split(/\s+/)))
    let score = 0
    for (const t of qTokens) {
      if (tokens.has(t)) score += 1          // coincidencia exacta de token
      else if ([...tokens].some(k => k.includes(t) && t.length >= 3)) score += 0.5 // subcadena
    }
    if (score > bestScore) { bestScore = score; best = item }
  }
  return bestScore >= MIN_SCORE ? best : null  // MIN_SCORE = 1
}
```

#### 5.7.4 Resolución de enlaces (`target_type` + `target_id`)

| `target_type` | `target_id` | Ruta generada |
|---|---|---|
| `PAGE` | `mapa` | `/mapa` |
| `PAGE` | `emergencias` | `/emergencias` |
| `PAGE` | `comunidad` | `/comunidad` |
| `SPECIALISTS_FILTER` | `{"rol":"abogado","idioma":"qu","minExp":5}` | `/especialistas?rol=abogado&idioma=qu&minExp=5` |
| `FORUM_TOPIC` | `<topic_id>` | `/comunidad/<topic_id>` |
| `PROFILE` | `<prof_id>` | `/especialistas/<prof_id>` |

#### 5.7.5 Registro de interacción

- Cada mensaje se guarda en `chat_messages` con `faq_item_id` (nullable): sirve para auditoría, no para generar contenido.

### 5.8 Foro y moderación

- Publicar: `INSERT` autenticado en `forum_topics`/`forum_posts` (RLS).
- Reportar: `INSERT` en `reports`; el admin ve la cola y oculta/restaura (`topic_status='HIDDEN'` o `forum_posts.hidden=true`).
- Temas `LOCKED` no aceptan nuevas respuestas (validación en Edge Function o RLS con check).

### 5.9 Administración

- Rol `ADMIN`: columna `profiles.role` (`USER`|`ADMIN`) o `app_metadata` en auth; el middleware `admin.ts` redirige a no-admins.
- Panel: cola de aprobación, revisión de reportes, CRUD de FAQ (categorías + ítems + traducciones + `age_mode`).

---

## 6. Seguridad

- **Autenticación:** Supabase Auth, email/password, confirmación de email, reset de contraseña.
- **RLS obligatoria:** ninguna tabla accesible sin política; triggers revocan acceso público por defecto.
- **PII de menores:** lectura restringida a menor, tutores aprobados y admins; los CVs usan Storage con firma temporal (`getSignedUrl`).
- **Reservas transaccionales** en Edge Functions (aislamiento, sin exposición de SQL de escritura al cliente).
- **Rate limiting:** `server/middleware/rate-limit.ts` para auth, reservas y escrituras del foro.
- **Secretos:** variables de entorno (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) nunca en el cliente; se usan tokens de servicio solo en Edge Functions/Nitro.

---

## 7. PWA, Rendimiento y Despliegue

### 7.1 PWA / Offline parcial

- Módulo `@vite-pwa/nuxt`: manifest, Service Worker con precache de shell y **caché runtime de FAQ de Ramon** y catálogos.
- Sin conexión: el widget Ramon funciona (FAQ en caché); las acciones transaccionales (reservas) requieren conexión.

### 7.2 Rendimiento

- Carga diferida (`defineAsyncComponent`) de MapaLeaflet y del widget Ramon; esto protege RNF-01 (bundle < 1.5 MB).
- Listados de especialistas paginados (`offset/limit`) y filtrados en la query (no en el cliente).

### 7.3 Despliegue

- **Frontend:** build estático `pnpm generate` → Vercel/Netlify/Cloudflare Pages (CDN).
- **Supabase:** migraciones en `supabase/migrations/`, Edge Functions desplegadas con `supabase functions deploy`.
- **Env vars:** `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY` (cliente); `SUPABASE_SERVICE_ROLE_KEY` solo en funciones Nitro/Edge.
- **Dominios:** app principal + verificación de email (SMTP en Supabase).

### 7.4 Comandos de desarrollo

```bash
pnpm install        # instala y ejecuta `nuxt prepare` (genera .nuxt/ y tipos)
pnpm dev            # servidor de desarrollo en http://localhost:3000
pnpm build          # build de producción
pnpm generate       # exportación estática (despliegue CDN)
pnpm preview        # previsualiza el build
```

> No hay scripts de test/lint/typecheck configurados aún en este repositorio.

---

## 8. Trazabilidad Requisito → Diseño

| Requisito (SRS) | Diseño (SDD) |
|---|---|
| RF-1.1–1.3 modos por edad | §5.1 `deriveAgeMode` + trigger |
| RF-1.4, UC-06 tutela | §5.2, tabla `guardian_links`, middleware `guardian.ts` |
| RF-2.x aprobación | §5.3 máquina de estados + Edge Function |
| RF-3.x búsqueda/mapa | §5.4 PostGIS + Leaflet |
| RF-4.x reservas | §5.5 Edge Function transaccional |
| RF-6.x emergencias | §5.6 enlaces `tel:` |
| RF-7.x Ramon | §5.7 motor FAQ determinista + tabla `faq_items` |
| RF-5.x foro / RF-8.x admin | §5.8, §5.9 |
| RNF-04..09 seguridad | §6 RLS + Edge Functions + rate limiting |
| RNF-13 PWA offline | §7.1 PWA caching |
