<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn, myApplication, refreshApplications, applyProfessional, update, restore } = useAuth()
const { roles: roleOptions, roleLabel, specialtyLabel, languageLabel } = useCatalog()
const { fallback, locate } = useGeolocation()

const headline = ref('')
const bio = ref('')
const experienceYears = ref(3)
const city = ref('Sucre')
const roles = ref<string[]>([])
const specialties = ref<string[]>([])
const languages = ref<string[]>([])
const location = ref<{ lat: number; lng: number } | null>(null)
const submitted = ref(false)
const error = ref('')
const submitting = ref(false)
const editingLocation = ref(false)
const editLocation = ref<{ lat: number; lng: number } | null>(null)
const savingLocation = ref(false)
const locationSaved = ref(false)

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

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

onMounted(async () => {
  await restore()
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  await refreshApplications()
  if (myApplication.value?.lat !== undefined && myApplication.value?.lng !== undefined) {
    location.value = { lat: myApplication.value.lat, lng: myApplication.value.lng }
  } else if (!location.value) {
    const c = await locate()
    location.value = { lat: c.lat, lng: c.lng }
  }
})

const currentLocation = computed(() =>
  location.value ?? (myApplication.value?.lat !== undefined && myApplication.value?.lng !== undefined
    ? { lat: myApplication.value.lat, lng: myApplication.value.lng }
    : fallback),
)

function startEditLocation() {
  editLocation.value = { ...currentLocation.value }
  locationSaved.value = false
  editingLocation.value = true
}

async function saveLocation() {
  if (!editLocation.value || savingLocation.value) return
  savingLocation.value = true
  locationSaved.value = false
  try {
    await update({ lat: editLocation.value.lat, lng: editLocation.value.lng })
    location.value = editLocation.value
    editingLocation.value = false
    locationSaved.value = true
  } catch (e) {
    error.value = String(e)
  } finally {
    savingLocation.value = false
  }
}

async function submit() {
  if (submitting.value) return
  error.value = ''
  if (!roles.value.length || !languages.value.length) {
    error.value = t('profesional.error_roles')
    return
  }
  submitting.value = true
  try {
    await applyProfessional({
      headline: headline.value,
      bio: bio.value,
      experienceYears: experienceYears.value,
      city: city.value,
      roles: roles.value,
      specialties: specialties.value,
      languages: languages.value,
      ...(location.value ? { lat: location.value.lat, lng: location.value.lng } : {}),
    })
    submitted.value = true
  } catch (e) {
    error.value = String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-[640px] mx-auto">
    <h1>{{ t('profesional.title') }}</h1>
    <p v-if="myApplication?.status === 'PENDING'" class="badge warn">{{ t('profesional.pending_hint') }}</p>

    <form v-if="!submitted && myApplication?.status !== 'APPROVED'" class="card" @submit.prevent="submit">
      <label>{{ t('profesional.headline') }}
        <input v-model="headline" class="input" required />
      </label>
      <label>{{ t('profesional.bio') }}
        <textarea v-model="bio" rows="3" class="input" required />
      </label>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        <label>{{ t('profesional.exp') }}
          <input v-model.number="experienceYears" type="number" min="0" max="60" class="input" />
        </label>
        <label>{{ t('profesional.city') }}
          <input v-model="city" class="input" />
        </label>
      </div>

      <p v-if="error" class="field-error">{{ error }}</p>

      <label>{{ t('profesional.roles') }}</label>
      <div class="flex flex-wrap gap-1 mt-1">
        <button
          v-for="r in roleOptions"
          :key="r"
          type="button"
          class="chip-tag"
          :class="{ active: roles.includes(r) }"
          :aria-pressed="roles.includes(r)"
          @click="roles = toggle(roles, r)"
        >{{ roleLabel(r) }}</button>
      </div>

      <template v-if="availableSpecialties.length">
        <label>{{ t('profesional.specialties') }}</label>
        <div class="flex flex-wrap gap-1 mt-1">
          <button
            v-for="s in availableSpecialties"
            :key="s"
            type="button"
            class="chip-tag"
            :class="{ active: specialties.includes(s) }"
            :aria-pressed="specialties.includes(s)"
            @click="specialties = toggle(specialties, s)"
          >{{ specialtyLabel(s) }}</button>
        </div>
      </template>

      <label>{{ t('profesional.languages') }}</label>
      <div class="flex flex-wrap gap-1 mt-1">
        <button
          v-for="l in languageOptions"
          :key="l"
          type="button"
          class="chip-tag"
          :class="{ active: languages.includes(l) }"
          :aria-pressed="languages.includes(l)"
          @click="languages = toggle(languages, l)"
        >{{ languageLabel(l) }}</button>
      </div>

      <label>{{ t('profesional.location') }}</label>
      <ClientOnly>
        <MapPicker v-model="location" :center="fallback" />
        <template #fallback>
          <div class="card">{{ t('mapa.not_found') }}</div>
        </template>
      </ClientOnly>
      <p class="text-muted text-sm mt-1">{{ t('profesional.location_hint') }}</p>

      <label>{{ t('profesional.cv') }}
        <input type="file" accept="application/pdf" class="input" />
      </label>

      <button class="btn btn-primary mt-4" type="submit" :disabled="submitting">{{ t('profesional.submit') }}</button>
    </form>

    <div v-else class="card">
      <p v-if="submitted" class="badge warn">{{ t('profesional.pending_hint') }}</p>
      <p v-if="myApplication?.status === 'APPROVED'" class="badge ok">{{ t('perfil.status.APPROVED') }}</p>
      <NuxtLink v-if="myApplication?.status === 'APPROVED'" to="/perfil/agenda" class="no-underline font-semibold text-primary-ink">{{ t('nav.agenda') }}</NuxtLink>

      <template v-if="myApplication?.status === 'APPROVED'">
        <button v-if="!editingLocation" class="btn mt-2" type="button" @click="startEditLocation">
          {{ t('profesional.edit_location') }}
        </button>
        <div v-else class="mt-3">
          <ClientOnly>
            <MapPicker v-model="editLocation" :center="currentLocation" />
            <template #fallback>
              <div class="card">{{ t('mapa.not_found') }}</div>
            </template>
          </ClientOnly>
          <div class="flex gap-3 items-center mt-2 flex-wrap">
            <button class="btn btn-primary" type="button" :disabled="savingLocation" @click="saveLocation">
              {{ t('profesional.save_location') }}
            </button>
            <button class="btn" type="button" :disabled="savingLocation" @click="editingLocation = false">
              {{ t('profesional.cancel') }}
            </button>
          </div>
          <p v-if="error" class="field-error">{{ error }}</p>
        </div>
      </template>

      <p v-if="locationSaved" class="badge ok mt-2">{{ t('profesional.location_saved') }}</p>
      <NuxtLink to="/perfil" class="no-underline font-semibold text-primary-ink">{{ t('comunidad.back') }}</NuxtLink>
    </div>
  </div>
</template>
