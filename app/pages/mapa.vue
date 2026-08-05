<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { coords, locate, permissionDenied, fallback } = useGeolocation()
const { specialists, fetchSpecialists } = useSpecialists()

onMounted(async () => {
  await locate()
  await fetchSpecialists()
})

const center = computed(() => coords.value ?? fallback)
</script>

<template>
  <div>
    <div class="flex justify-between items-center gap-3 flex-wrap">
      <h1>{{ t('mapa.title') }}</h1>
      <button class="btn" @click="locate().then(fetchSpecialists)">{{ t('mapa.refresh') }}</button>
    </div>
    <p v-if="permissionDenied" class="text-muted text-sm">{{ t('especialistas.no_geo', { city: 'Sucre' }) }}</p>
    <ClientOnly>
      <MapLeaflet :specialists="specialists" :center="center" @select="id => navigateTo(`/especialistas/${id}`)" />
      <template #fallback>
        <div class="card">{{ t('mapa.not_found') }}</div>
      </template>
    </ClientOnly>
    <h2 class="mt-4">{{ t('nav.especialistas') }}</h2>
    <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
      <SpecialistCard v-for="s in specialists" :key="s.id" :specialist="s" />
    </div>
  </div>
</template>
