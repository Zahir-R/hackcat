<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { specialists, filters, fetchSpecialists } = useSpecialists()
const { coords, locate, permissionDenied, fallback } = useGeolocation()

const roles = ['abogado', 'psicologo', 'trabajador_social', 'traductor', 'paralegal']
const specialtiesAll = ['familia', 'pensiones', 'laboral', 'penal', 'violencia', 'infancia', 'duelo', 'familiar', 'orientacion', 'proteccion', 'quechua', 'guarani', 'señas', 'ingles', 'tramites', 'documentacion', 'ventanilla']
const languages = ['es', 'qu', 'gn', 'en', 'lsa']

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
      <div class="spread">
        <strong>{{ t('especialistas.filters') }}</strong>
        <span v-if="permissionDenied" class="muted">{{ t('especialistas.no_geo', { city: 'Sucre' }) }}</span>
      </div>
      <div class="filters">
        <label>{{ t('especialistas.rol') }}
          <select v-model="filters.rol">
            <option value="">—</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </label>
        <label>{{ t('especialistas.especialidad') }}
          <select v-model="filters.especialidad">
            <option value="">—</option>
            <option v-for="s in specialtiesAll" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>
        <label>{{ t('especialistas.idioma') }}
          <select v-model="filters.idioma">
            <option value="">—</option>
            <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
          </select>
        </label>
        <label>{{ t('especialistas.minExp') }}
          <input v-model.number="filters.minExp" type="number" min="0" max="40" />
        </label>
        <label>{{ t('especialistas.radius') }}
          <input v-model.number="filters.radius" type="number" min="1" max="300" />
        </label>
      </div>
      <div class="row mt">
        <button class="primary" @click="apply">{{ t('especialistas.apply') }}</button>
        <button @click="reset">{{ t('especialistas.reset') }}</button>
        <button @click="locate().then(apply)">{{ t('mapa.refresh') }}</button>
      </div>
    </div>

    <p v-if="!specialists.length" class="muted">{{ t('especialistas.empty') }}</p>
    <div class="grid grid-2">
      <SpecialistCard v-for="s in specialists" :key="s.id" :specialist="s" />
    </div>
  </div>
</template>

<style scoped>
.filters { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.6rem; }
</style>
