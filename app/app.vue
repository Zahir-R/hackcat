<script setup lang="ts">
const { ageMode } = useAgeMode()
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
