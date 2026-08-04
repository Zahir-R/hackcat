// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
  ],
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Justicia Cerca',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0f5c4d' },
      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }],
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      appUrl: '',
      cityFallback: 'Sucre',
      cityFallbackLat: -19.0333,
      cityFallbackLng: -65.2627,
    },
  },

  i18n: {
    defaultLocale: 'es',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'qu', name: 'Runasimi (Quechua)', file: 'qu.json' },
      { code: 'gn', name: 'Avañe\'ẽ (Guaraní)', file: 'gn.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico'],
    manifest: {
      name: 'Justicia Cerca',
      short_name: 'Justicia',
      description: 'Conexión ciudadana con profesionales de apoyo jurídico y psicosocial',
      theme_color: '#0f5c4d',
      background_color: '#f6f7f4',
      display: 'standalone',
      lang: 'es',
      icons: [],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
    },
    devOptions: { enabled: false },
  },
})
