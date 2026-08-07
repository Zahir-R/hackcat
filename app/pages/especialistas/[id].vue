<script setup lang="ts">
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

const { t } = useI18n()
const route = useRoute()
const id = route.params.id as string
const { roleLabel, specialtyLabel, languageLabel } = useCatalog()

const { data: specialist } = await useFetch(`/api/specialists/${id}`)
const { slots, myBookings, message, fetchSlots, createBooking, clearMessage } = useBookings()
const { isLoggedIn } = useAuth()

const selectedSlot = ref<string | null>(null)
const notes = ref('')
const showConfirm = ref(false)

onMounted(async () => {
  await fetchSlots(id)
})

const slotsByModality = computed(() => {
  const map: Record<string, typeof slots.value> = {}
  for (const s of slots.value) {
    if (s.isBooked) continue
    ;(map[s.modality] ??= []).push(s)
  }
  return map
})

function pickSlot(slotId: string) {
  selectedSlot.value = slotId
  showConfirm.value = true
}

async function confirmBooking() {
  const slot = slots.value.find(s => s.id === selectedSlot.value)
  if (!slot) return
  clearMessage()
  await createBooking(id, slot, notes.value)
  showConfirm.value = false
  navigateTo('/perfil')
}

function fmt(s: string) {
  const d = new Date(s)
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d)
}
</script>

<template>
  <div v-if="specialist">
    <div class="card">
      <div class="flex gap-3 items-center">
        <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {{ specialist.name.charAt(0) }}
        </div>
        <div>
          <h1 class="m-0">{{ specialist.name }}</h1>
          <div class="text-muted text-sm">{{ specialist.headline }}</div>
        </div>
      </div>
      <p class="mt-4">{{ specialist.bio }}</p>
      <div>
        <span v-for="r in specialist.roles" :key="r" class="pill">{{ roleLabel(r) }}</span>
        <span v-for="s in specialist.specialties" :key="s" class="pill">{{ specialtyLabel(s) }}</span>
        <span v-for="l in specialist.languages" :key="l" class="pill lang">{{ languageLabel(l) }}</span>
      </div>
      <div class="text-muted text-sm mt-4 inline-flex items-center gap-1.5"><FontAwesomeIcon :icon="faLocationDot" /> {{ specialist.city }} · {{ specialist.experienceYears }} años de experiencia</div>
    </div>

    <div class="card">
      <h2>{{ t('reservar.title') }} {{ specialist.name }}</h2>
      <p v-if="!isLoggedIn" class="text-muted text-sm">
        Debes <NuxtLink to="/auth/login">ingresar</NuxtLink> para reservar.
      </p>
      <template v-else>
        <p v-if="message" class="badge ok">{{ message }}</p>

        <div v-if="!Object.keys(slotsByModality).length" class="text-muted text-sm">{{ t('reservar.no_slots') }}</div>

        <div v-for="(list, modality) in slotsByModality" :key="modality" class="mt-4">
          <strong>{{ t(`especialistas.${modality === 'VISIT' ? 'visit' : modality === 'VOICE' ? 'voice' : 'video'}`) }}</strong>
          <div class="flex flex-wrap gap-2 mt-1">
            <button
              v-for="s in list"
              :key="s.id"
              class="chip-tag"
              :class="{ active: selectedSlot === s.id }"
              @click="pickSlot(s.id)"
            >
              {{ fmt(s.startsAt) }}
            </button>
          </div>
        </div>

        <label class="mt-4">{{ t('reservar.notes') }}
          <textarea v-model="notes" rows="2" class="input" />
        </label>
      </template>
    </div>

    <ModalConfirm
      :open="showConfirm"
      :title="t('reservar.confirm')"
      :message="t('reservar.detail')"
      @confirm="confirmBooking"
      @close="showConfirm = false"
    />
  </div>
</template>
