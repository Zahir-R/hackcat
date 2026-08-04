<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const id = route.params.id as string

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
  await createBooking(id, slot, notes.value, '')
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
      <div class="spec-head">
        <div class="avatar">{{ specialist.name.charAt(0) }}</div>
        <div>
          <h1 style="margin: 0">{{ specialist.name }}</h1>
          <div class="muted">{{ specialist.headline }}</div>
        </div>
      </div>
      <p class="mt">{{ specialist.bio }}</p>
      <div>
        <span v-for="r in specialist.roles" :key="r" class="pill">{{ r }}</span>
        <span v-for="s in specialist.specialties" :key="s" class="pill">{{ s }}</span>
        <span v-for="l in specialist.languages" :key="l" class="pill lang">{{ l }}</span>
      </div>
      <div class="muted mt">📍 {{ specialist.city }} · {{ specialist.experienceYears }} años de experiencia</div>
    </div>

    <div class="card">
      <h2>{{ t('reservar.title') }} {{ specialist.name }}</h2>
      <p v-if="!isLoggedIn" class="muted">
        Debes <NuxtLink to="/auth/login">ingresar</NuxtLink> para reservar.
      </p>
      <template v-else>
        <p v-if="message" class="badge ok">{{ message }}</p>

        <div v-if="!Object.keys(slotsByModality).length" class="muted">{{ t('reservar.no_slots') }}</div>

        <div v-for="(list, modality) in slotsByModality" :key="modality" class="mt">
          <strong>{{ t(`especialistas.${modality === 'VISIT' ? 'visit' : modality === 'VOICE' ? 'voice' : 'video'}`) }}</strong>
          <div class="slot-list">
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

        <label class="mt">{{ t('reservar.notes') }}
          <textarea v-model="notes" rows="2" />
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

<style scoped>
.spec-head { display: flex; gap: 0.8rem; align-items: center; }
.avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 700;
}
.slot-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.4rem; }
.pill.lang { background: #fdeeda; }
</style>
