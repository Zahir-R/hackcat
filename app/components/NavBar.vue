<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn, isAdmin, user, logout } = useAuth()
const locale = useI18n()
const route = useRoute()

const links = computed(() => [
  { to: '/', label: t('nav.inicio'), exact: true },
  { to: '/mapa', label: t('nav.mapa') },
  { to: '/especialistas', label: t('nav.especialistas') },
  { to: '/comunidad', label: t('nav.comunidad') },
  { to: '/emergencias', label: t('nav.emergencias') },
])

const locales = [
  { code: 'es', label: 'ES' },
  { code: 'qu', label: 'QU' },
  { code: 'gn', label: 'GN' },
  { code: 'en', label: 'EN' },
]

function setLocale(code: string) {
  locale.setLocale(code)
  window.localStorage.setItem('jc_locale', code)
}

function onLogout() {
  logout()
  navigateTo('/')
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <NuxtLink to="/" class="brand">⚖️ {{ t('app.name') }}</NuxtLink>

      <nav class="nav-links">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" :class="{ active: l.exact ? route.path === l.to : route.path.startsWith(l.to) }">
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="nav-actions">
        <select
          class="lang-select"
          :value="locale.locale.value"
          @change="e => setLocale((e.target as HTMLSelectElement).value)"
        >
          <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.label }}</option>
        </select>

        <template v-if="isLoggedIn">
          <NuxtLink to="/perfil" class="btn-nav">{{ user?.displayName }}</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" class="btn-nav">Admin</NuxtLink>
          <button class="btn-nav" @click="onLogout">{{ t('nav.salir') }}</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="btn-nav">{{ t('nav.ingresar') }}</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.brand { font-weight: 800; color: var(--color-primary); text-decoration: none; }
.nav-links { display: flex; gap: 0.2rem; flex: 1; flex-wrap: wrap; }
.nav-links a {
  color: var(--color-muted);
  text-decoration: none;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.nav-links a.active, .nav-links a:hover { color: var(--color-primary); background: #eef4f0; }
.nav-actions { display: flex; align-items: center; gap: 0.4rem; }
.lang-select { min-height: 36px; width: auto; padding: 0.3rem 0.5rem; }
.btn-nav {
  border: none;
  background: none;
  color: var(--color-primary);
  text-decoration: none;
  min-height: 40px;
  padding: 0 0.5rem;
  font-weight: 600;
}
</style>
