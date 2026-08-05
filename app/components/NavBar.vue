<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn, isAdmin, user, logout } = useAuth()
const locale = useI18n()
const route = useRoute()

const mobileOpen = ref(false)

function currentPath(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const links = computed(() => [
  { to: '/', label: t('nav.inicio'), exact: true },
  { to: '/mapa', label: t('nav.mapa') },
  { to: '/especialistas', label: t('nav.especialistas') },
  { to: '/comunidad', label: t('nav.comunidad') },
  { to: '/emergencias', label: t('nav.emergencias') },
])

const locales = [
  { code: 'es', label: 'Español' },
  { code: 'qu', label: 'Quechua' },
  { code: 'gn', label: 'Guaraní' },
  { code: 'en', label: 'Inglés' },
]

function setLocale(code: string) {
  locale.setLocale(code)
  window.localStorage.setItem('jc_locale', code)
}

function onLogout() {
  logout()
  mobileOpen.value = false
  navigateTo('/')
}

function closeMenu() {
  mobileOpen.value = false
}

watch(() => route.fullPath, closeMenu)
</script>

<template>
  <header class="sticky top-0 z-[600] bg-surface border-b border-border shadow-card">
    <div class="max-w-[1100px] mx-auto px-4 py-2 flex items-center gap-4">
      <NuxtLink to="/" class="font-display font-extrabold text-primary-ink text-lg whitespace-nowrap no-underline" @click="closeMenu">
        ⚖️ {{ t('app.name') }}
      </NuxtLink>

      <nav class="hidden md:flex flex-1 gap-1 items-center">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="relative no-underline text-text font-semibold px-2.5 py-2 min-h-11 inline-flex items-center rounded-lg hover:bg-[#F0D3A8] hover:text-primary-ink after:absolute after:left-2.5 after:right-2.5 after:bottom-0.5 after:h-0.5 after:rounded after:bg-primary-ink after:scale-x-0 after:origin-left after:transition-transform after:duration-200"
          :class="currentPath(l.to) ? 'text-primary-ink after:scale-x-100' : ''"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="hidden md:flex items-center gap-1">
        <select
          class="min-h-9 h-9 w-auto px-2 max-w-36 bg-primary-dark text-white border border-primary rounded-lg"
          aria-label="Idioma"
          :value="locale.locale.value"
          @change="e => setLocale((e.target as HTMLSelectElement).value)"
        >
          <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.label }}</option>
        </select>

        <template v-if="isLoggedIn">
          <NuxtLink to="/perfil" class="inline-flex items-center no-underline text-text font-semibold min-h-10 px-2 hover:text-primary-ink">
            {{ t('nav.perfil') }}
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" class="inline-flex items-center no-underline text-text font-semibold min-h-10 px-2 hover:text-primary-ink">
            {{ t('nav.admin') }}
          </NuxtLink>
          <button class="inline-flex items-center bg-transparent border-none text-text font-semibold min-h-10 px-2 hover:text-primary-ink" @click="onLogout">
            {{ t('nav.salir') }}
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="inline-flex items-center bg-ingresar-bg text-[#5A2A1B] font-semibold rounded-lg px-3.5 py-2 min-h-10 no-underline hover:bg-[#F0D3A8]">
            {{ t('nav.ingresar') }}
          </NuxtLink>
        </template>
      </div>

      <button
        class="md:hidden ml-auto flex flex-col justify-center items-center gap-1 bg-transparent border-none w-11 h-11 min-w-11 min-h-11 p-0"
        :aria-expanded="mobileOpen"
        aria-label="Menú"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="w-[22px] h-0.5 bg-primary-ink rounded" />
        <span class="w-[22px] h-0.5 bg-primary-ink rounded" />
        <span class="w-[22px] h-0.5 bg-primary-ink rounded" />
      </button>
    </div>

    <div v-if="mobileOpen" class="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1 shadow-card">
      <NuxtLink
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="no-underline text-text font-semibold py-3 px-2 rounded-lg hover:bg-[#F0D3A8]"
        :class="currentPath(l.to) ? 'text-primary-ink bg-[#F0D3A8]' : ''"
        @click="closeMenu"
      >
        {{ l.label }}
      </NuxtLink>

      <div class="h-px bg-border my-2" />

      <select
        class="w-full min-h-11 bg-primary-dark text-white border border-primary rounded-lg px-2"
        aria-label="Idioma"
        :value="locale.locale.value"
        @change="e => setLocale((e.target as HTMLSelectElement).value)"
      >
        <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.label }}</option>
      </select>

      <template v-if="isLoggedIn">
        <NuxtLink
          to="/perfil"
          class="no-underline text-text font-semibold py-3 px-2 rounded-lg hover:bg-[#F0D3A8]"
          @click="closeMenu"
        >
          {{ t('nav.perfil') }}
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          to="/admin"
          class="no-underline text-text font-semibold py-3 px-2 rounded-lg hover:bg-[#F0D3A8]"
          @click="closeMenu"
        >
          {{ t('nav.admin') }}
        </NuxtLink>
        <button
          class="text-left bg-transparent border-none text-text font-semibold py-3 px-2 rounded-lg hover:bg-[#F0D3A8]"
          @click="onLogout"
        >
          {{ t('nav.salir') }}
        </button>
      </template>
      <template v-else>
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center justify-center bg-ingresar-bg text-[#5A2A1B] font-semibold rounded-lg px-3.5 py-3 no-underline hover:bg-[#F0D3A8]"
          @click="closeMenu"
        >
          {{ t('nav.ingresar') }}
        </NuxtLink>
      </template>
    </div>
  </header>
</template>
