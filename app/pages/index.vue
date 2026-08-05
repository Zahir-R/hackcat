<script setup lang="ts">
const { t } = useI18n()
const { birthDate, setBirthDate, ageMode } = useAgeMode()

const quickLinks = computed(() => [
  { to: '/especialistas', label: t('nav.especialistas'), icon: '🧑‍⚖️' },
  { to: '/mapa', label: t('nav.mapa'), icon: '🗺️' },
  { to: '/comunidad', label: t('nav.comunidad'), icon: '💬' },
  { to: '/emergencias', label: t('nav.emergencias'), icon: '🚨' },
])
</script>

<template>
  <div>
    <section class="card p-6 border-primary-dark bg-[linear-gradient(135deg,var(--color-primary-dark),var(--color-primary))]">
      <h1 class="text-[#FBEFDA] text-[2rem] mt-0 mb-2">{{ t('home.hero') }}</h1>
      <p class="text-[#F0D3A8] mb-0">{{ t('home.sub') }}</p>
    </section>

    <section>
      <h2>{{ t('home.quick_links') }}</h2>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        <NuxtLink v-for="q in quickLinks" :key="q.to" :to="q.to" class="card flex items-center gap-2.5 no-underline text-text hover:border-accent">
          <span class="text-2xl">{{ q.icon }}</span>
          {{ q.label }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
