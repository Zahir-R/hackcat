<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { specialists, filters, fetchSpecialists } = useSpecialists()
const { coords, locate, permissionDenied, fallback } = useGeolocation()
const { roles, specialties, languages, roleLabel, specialtyLabel, languageLabel } = useCatalog()

onMounted(async () => {
  const q = route.query
  filters.value = {
    rol: String(q.rol ?? ''),
    especialidad: String(q.especialidad ?? ''),
    idioma: String(q.idioma ?? ''),
    minExp: Number(q.minExp ?? 0),
    radius: Number(q.radius ?? 100),
  }
  await locate()
  await fetchSpecialists()
})

async function apply() {
  await fetchSpecialists()
}

function reset() {
  filters.value = { rol: '', especialidad: '', idioma: '', minExp: 0, radius: 100 }
  apply()
}
</script>

<template>
  <div>
    <h1>{{ t('especialistas.title') }}</h1>

    <div class="card">
      <div class="flex justify-between items-center gap-3 flex-wrap">
        <strong>{{ t('especialistas.filters') }}</strong>
        <span v-if="permissionDenied" class="text-muted text-sm">{{ t('especialistas.no_geo', { city: 'Sucre' }) }}</span>
      </div>
      <div class="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        <label>{{ t('especialistas.rol') }}
          <select v-model="filters.rol" class="input bg-primary-dark text-white border-primary">
            <option value="">—</option>
            <option v-for="r in roles" :key="r" :value="r">{{ roleLabel(r) }}</option>
          </select>
        </label>
        <label>{{ t('especialistas.especialidad') }}
          <select v-model="filters.especialidad" class="input bg-primary-dark text-white border-primary">
            <option value="">—</option>
            <option v-for="s in specialties" :key="s" :value="s">{{ specialtyLabel(s) }}</option>
          </select>
        </label>
        <label>{{ t('especialistas.idioma') }}
          <select v-model="filters.idioma" class="input bg-primary-dark text-white border-primary">
            <option value="">—</option>
            <option v-for="l in languages" :key="l" :value="l">{{ languageLabel(l) }}</option>
          </select>
        </label>
        <label>{{ t('especialistas.minExp') }}
          <input v-model.number="filters.minExp" type="number" min="0" max="40" class="input bg-primary-dark text-white border-primary" />
        </label>
        <label>{{ t('especialistas.radius') }}
          <input v-model.number="filters.radius" type="number" min="1" max="300" class="input bg-primary-dark text-white border-primary" />
        </label>
      </div>
      <div class="flex gap-3 items-center flex-wrap mt-4">
        <button class="btn btn-primary" @click="apply">{{ t('especialistas.apply') }}</button>
        <button class="btn" @click="reset">{{ t('especialistas.reset') }}</button>
        <button class="btn" @click="locate().then(apply)">{{ t('mapa.refresh') }}</button>
      </div>
    </div>

    <p v-if="!specialists.length" class="text-muted text-sm">{{ t('especialistas.empty') }}</p>
    <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
      <SpecialistCard v-for="s in specialists" :key="s.id" :specialist="s" />
    </div>
  </div>
</template>
