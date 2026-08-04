<script setup lang="ts">
import type { Ref } from 'vue'
const { t } = useI18n()
const { applyProfessional, myApplication, isLoggedIn } = useAuth()

const headline = ref('')
const bio = ref('')
const experienceYears = ref(3)
const city = ref('Sucre')
const roles = ref<string[]>([])
const specialties = ref<string[]>([])
const languages = ref<string[]>([])
const submitted = ref(false)

const roleOptions = ['abogado', 'psicologo', 'trabajador_social', 'traductor', 'paralegal']
const specialtyByRole: Record<string, string[]> = {
  abogado: ['familia', 'pensiones', 'laboral', 'penal', 'violencia'],
  psicologo: ['infancia', 'violencia', 'duelo', 'familiar'],
  trabajador_social: ['orientacion', 'familiar', 'proteccion'],
  traductor: ['quechua', 'guarani', 'señas', 'ingles'],
  paralegal: ['tramites', 'documentacion', 'ventanilla'],
}
const languageOptions = ['es', 'qu', 'gn', 'en', 'lsa']

const availableSpecialties = computed(() =>
  [...new Set(roles.value.flatMap(r => specialtyByRole[r] ?? []))],
)

watch(availableSpecialties, () => {
  specialties.value = specialties.value.filter(s => availableSpecialties.value.includes(s))
})

function toggle(list: Ref<string[]>, value: string) {
  list.value = list.value.includes(value) ? list.value.filter(v => v !== value) : [...list.value, value]
}

onMounted(() => {
  if (!isLoggedIn.value) navigateTo('/auth/login')
})

function submit() {
  applyProfessional({
    name: '—',
    headline: headline.value,
    bio: bio.value,
    experienceYears: experienceYears.value,
    city: city.value,
    roles: roles.value,
    specialties: specialties.value,
    languages: languages.value,
  })
  submitted.value = true
}
</script>

<template>
  <div class="wrap">
    <h1>{{ t('profesional.title') }}</h1>
    <p v-if="myApplication?.status === 'PENDING'" class="badge warn">{{ t('profesional.pending_hint') }}</p>

    <form v-if="!submitted && myApplication?.status !== 'APPROVED'" class="card" @submit.prevent="submit">
      <label>{{ t('profesional.headline') }}
        <input v-model="headline" required />
      </label>
      <label>{{ t('profesional.bio') }}
        <textarea v-model="bio" rows="3" required />
      </label>
      <div class="grid grid-2">
        <label>{{ t('profesional.exp') }}
          <input v-model.number="experienceYears" type="number" min="0" max="60" />
        </label>
        <label>{{ t('profesional.city') }}
          <input v-model="city" />
        </label>
      </div>

      <label>{{ t('profesional.roles') }}</label>
      <div class="chips">
        <button
          v-for="r in roleOptions"
          :key="r"
          type="button"
          class="chip-tag"
          :class="{ active: roles.includes(r) }"
          @click="toggle(roles, r)"
        >{{ r }}</button>
      </div>

      <template v-if="availableSpecialties.length">
        <label>{{ t('profesional.specialties') }}</label>
        <div class="chips">
          <button
            v-for="s in availableSpecialties"
            :key="s"
            type="button"
            class="chip-tag"
            :class="{ active: specialties.includes(s) }"
            @click="toggle(specialties, s)"
          >{{ s }}</button>
        </div>
      </template>

      <label>{{ t('profesional.languages') }}</label>
      <div class="chips">
        <button
          v-for="l in languageOptions"
          :key="l"
          type="button"
          class="chip-tag"
          :class="{ active: languages.includes(l) }"
          @click="toggle(languages, l)"
        >{{ l }}</button>
      </div>

      <label>{{ t('profesional.cv') }}
        <input type="file" accept="application/pdf" />
      </label>

      <button class="primary mt" type="submit">{{ t('profesional.submit') }}</button>
    </form>

    <div v-else class="card">
      <p v-if="submitted" class="badge warn">{{ t('profesional.pending_hint') }}</p>
      <NuxtLink to="/perfil" class="btn-link">{{ t('comunidad.back') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.wrap { max-width: 640px; margin: 0 auto; }
.chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.3rem; }
.btn-link { text-decoration: none; font-weight: 600; color: var(--color-primary); }
</style>
