<script setup lang="ts">
import {
  faScaleBalanced,
  faMapLocationDot,
  faComments,
  faTriangleExclamation,
  faChild,
  faUserLarge,
  faPersonCane,
  faUserShield,
  faHeadset,
  faPhoneVolume,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'

const { t } = useI18n()
const { birthDate, setBirthDate, ageMode } = useAgeMode()

const quickLinks = computed(() => [
  { to: '/especialistas', label: t('nav.especialistas'), icon: faScaleBalanced, desc: t('home.ql_especialistas') },
  { to: '/mapa', label: t('nav.mapa'), icon: faMapLocationDot, desc: t('home.ql_mapa') },
  { to: '/comunidad', label: t('nav.comunidad'), icon: faComments, desc: t('home.ql_comunidad') },
  { to: '/emergencias', label: t('nav.emergencias'), icon: faTriangleExclamation, desc: t('home.ql_emergencias') },
])

const steps = computed(() => [
  { n: 1, title: t('home.how_1_title'), desc: t('home.how_1_desc') },
  { n: 2, title: t('home.how_2_title'), desc: t('home.how_2_desc') },
  { n: 3, title: t('home.how_3_title'), desc: t('home.how_3_desc') },
])

const modes = computed(() => [
  { key: 'CHILD', icon: faChild },
  { key: 'ADULT', icon: faUserLarge },
  { key: 'ELDER', icon: faPersonCane },
])

const trust = computed(() => [
  { icon: faUserShield, title: t('home.trust_verified'), desc: t('home.trust_verified_desc') },
  { icon: faHeadset, title: t('home.trust_ramon'), desc: t('home.trust_ramon_desc') },
  { icon: faPhoneVolume, title: t('home.trust_support'), desc: t('home.trust_support_desc') },
])
</script>

<template>
  <div>
    <section class="card p-8 border-t-4 border-t-primary bg-[#F7F1E8]">
      <p class="uppercase tracking-wider text-xs font-semibold text-accent mt-0 mb-2">{{ t('app.name') }}</p>
      <h1 class="text-primary-ink text-[2rem] mt-0 mb-2">{{ t('home.hero') }}</h1>
      <p class="text-muted mb-5">{{ t('home.sub') }}</p>
      <div class="flex gap-3 flex-wrap">
        <NuxtLink to="/especialistas" class="btn btn-primary no-underline">
          {{ t('home.cta_specialists') }} <FontAwesomeIcon :icon="faArrowRight" />
        </NuxtLink>
        <NuxtLink to="/mapa" class="btn no-underline">
          <FontAwesomeIcon :icon="faMapLocationDot" /> {{ t('home.cta_map') }}
        </NuxtLink>
      </div>
    </section>

    <section class="mb-8">
      <h2>{{ t('home.how_title') }}</h2>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        <div v-for="s in steps" :key="s.n" class="card">
          <div class="w-10 h-10 rounded-full bg-accent-soft text-primary-ink font-display font-bold flex items-center justify-center text-lg mb-3">{{ s.n }}</div>
          <h3 class="mt-0 mb-1 text-base">{{ s.title }}</h3>
          <p class="text-muted text-sm mb-0">{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2>{{ t('home.explore_title') }}</h2>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        <NuxtLink v-for="q in quickLinks" :key="q.to" :to="q.to" class="card no-underline text-text hover:border-primary">
          <span class="flex items-center gap-2.5 mb-1">
            <FontAwesomeIcon :icon="q.icon" class="text-xl text-primary" />
            <strong>{{ q.label }}</strong>
          </span>
          <span class="text-muted text-sm">{{ q.desc }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="mb-8">
      <h2>{{ t('home.modes_title') }}</h2>
      <p class="text-muted text-sm mt-0">{{ t('home.modes_hint') }}</p>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        <div v-for="m in modes" :key="m.key" class="card">
          <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mb-3">
            <FontAwesomeIcon :icon="m.icon" />
          </div>
          <h3 class="mt-0 mb-1 text-base">{{ t(`home.modes.${m.key}.label`) }}</h3>
          <p class="text-muted text-sm mb-0">{{ t(`home.modes.${m.key}.desc`) }}</p>
        </div>
      </div>
    </section>

    <section class="card mb-8">
      <h2 class="mt-0">{{ t('home.about_title') }}</h2>
      <p class="mb-0">{{ t('home.about_body') }}</p>
    </section>

    <section class="mb-8">
      <h2>{{ t('home.trust_title') }}</h2>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        <div v-for="tr in trust" :key="tr.title" class="card">
          <div class="w-10 h-10 rounded-full bg-accent-soft text-primary-ink flex items-center justify-center mb-3">
            <FontAwesomeIcon :icon="tr.icon" />
          </div>
          <h3 class="mt-0 mb-1 text-base">{{ tr.title }}</h3>
          <p class="text-muted text-sm mb-0">{{ tr.desc }}</p>
        </div>
      </div>
    </section>

    <p class="text-muted text-xs text-center mt-2">{{ t('footer.disclaimer') }}</p>
  </div>
</template>
