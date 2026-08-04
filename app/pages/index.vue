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
    <section class="card hero">
      <h1>{{ t('home.hero') }}</h1>
      <p>{{ t('home.sub') }}</p>
    </section>

    <section class="card">
      <h2>{{ t('home.choose_mode') }}</h2>
      <ProfileScroller :model-value="birthDate" @update:model-value="setBirthDate" />
      <div class="grid grid-2" style="margin-top: 1rem">
        <div v-for="m in ['CHILD', 'ADULT', 'ELDER']" :key="m" class="mode-card" :class="{ active: ageMode === m }">
          <strong>{{ t(`home.modes.${m}.label`) }}</strong>
          <div class="muted">{{ t(`home.modes.${m}.desc`) }}</div>
        </div>
      </div>
    </section>

    <section>
      <h2>{{ t('home.quick_links') }}</h2>
      <div class="grid grid-2">
        <NuxtLink v-for="q in quickLinks" :key="q.to" :to="q.to" class="card quick">
          <span class="quick-icon">{{ q.icon }}</span>
          {{ q.label }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: #fff; }
.hero p { color: #d9e7e1; }
.mode-card { border: 2px solid var(--color-border); border-radius: var(--radius); padding: 0.8rem; }
.mode-card.active { border-color: var(--color-primary); background: #eef4f0; }
.quick { display: flex; align-items: center; gap: 0.7rem; text-decoration: none; color: inherit; }
.quick-icon { font-size: 1.5rem; }
</style>
