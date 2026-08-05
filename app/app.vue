<script setup lang="ts">
const { ageMode } = useAgeMode()

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Karla:wght@400;600;700&family=Lora:ital,wght@0,500;0,600;1,500&display=swap',
    },
  ],
})

if (import.meta.client) {
  watchEffect(() => {
    document.documentElement.dataset.mode = ageMode.value
  })
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>