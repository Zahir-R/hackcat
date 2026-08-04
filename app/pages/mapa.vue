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
    <div class="spread">
      <h1>{{ t('mapa.title') }}</h1>
      <button @click="locate().then(fetchSpecialists)">{{ t('mapa.refresh') }}</button>
    </div>
    <p v-if="permissionDenied" class="muted">{{ t('especialistas.no_geo', { city: 'Sucre' }) }}</p>
    <ClientOnly>
      <MapLeaflet :specialists="specialists" :center="center" @select="id => navigateTo(`/especialistas/${id}`)" />
      <template #fallback>
        <div class="card">{{ t('mapa.not_found') }}</div>
      </template>
    </ClientOnly>
    <h2 class="mt">{{ t('nav.especialistas') }}</h2>
    <div class="grid grid-2">
      <SpecialistCard v-for="s in specialists" :key="s.id" :specialist="s" />
    </div>
  </div>
</template>
