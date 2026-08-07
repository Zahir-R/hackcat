<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn, myApplication, refreshApplications, restore } = useAuth()
const { mySlots, professionalBookings, message, fetchMySlots, fetchProfessionalBookings, createSlot, deleteSlot, confirmBooking, rejectBooking, completeBooking, clearMessage } = useBookings()

const date = ref('')
const time = ref('')
const duration = ref(60)
const modality = ref<'VISIT' | 'VOICE' | 'VIDEO'>('VISIT')
const error = ref('')
const busy = ref(false)
const deleting = ref<string | null>(null)

onMounted(async () => {
  await restore()
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  await refreshApplications()
  if (myApplication.value?.status !== 'APPROVED') return
  await Promise.all([fetchMySlots(), fetchProfessionalBookings()])
})

const approved = computed(() => myApplication.value?.status === 'APPROVED')

async function submitSlot() {
  if (busy.value) return
  error.value = ''
  clearMessage()
  if (!date.value || !time.value) {
    error.value = t('agenda.error_fields')
    return
  }
  const starts = new Date(`${date.value}T${time.value}`)
  if (Number.isNaN(starts.getTime()) || starts.getTime() <= Date.now()) {
    error.value = t('agenda.error_future')
    return
  }
  const ends = new Date(starts.getTime() + duration.value * 60000)
  busy.value = true
  try {
    await createSlot(starts.toISOString(), ends.toISOString(), modality.value)
    date.value = ''
    time.value = ''
  } finally {
    busy.value = false
  }
}

async function removeSlot(slotId: string) {
  deleting.value = slotId
  try {
    await deleteSlot(slotId)
  } finally {
    deleting.value = null
  }
}

function fmt(s: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(s))
}

const upcomingBookings = computed(() =>
  professionalBookings.value.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED'),
)

const pastBookings = computed(() =>
  professionalBookings.value.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED'),
)
</script>

<template>
  <div class="max-w-[860px] mx-auto">
    <h1>{{ t('agenda.title') }}</h1>

    <div v-if="!isLoggedIn" class="card text-muted text-sm">
      {{ t('agenda.not_logged') }} <NuxtLink to="/auth/login">{{ t('auth.login') }}</NuxtLink>
    </div>

    <div v-else-if="!approved" class="card">
      <p class="badge warn">{{ t('agenda.not_approved') }}</p>
      <p class="text-muted text-sm">{{ t('agenda.not_approved_hint') }}</p>
      <NuxtLink to="/perfil" class="no-underline font-semibold text-primary-ink">{{ t('comunidad.back') }}</NuxtLink>
    </div>

    <template v-else>
      <p v-if="message" class="badge ok">{{ message }}</p>

      <section class="card">
        <h2>{{ t('agenda.new_slot') }}</h2>
        <p v-if="error" class="field-error">{{ error }}</p>
        <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          <label>{{ t('agenda.date') }}
            <input v-model="date" type="date" class="input" :min="new Date().toISOString().slice(0, 10)" />
          </label>
          <label>{{ t('agenda.time') }}
            <input v-model="time" type="time" class="input" />
          </label>
          <label>{{ t('agenda.duration') }}
            <select v-model="duration" class="input">
              <option :value="30">30 min</option>
              <option :value="60">60 min</option>
              <option :value="90">90 min</option>
            </select>
          </label>
          <label>{{ t('agenda.modality') }}
            <select v-model="modality" class="input">
              <option value="VISIT">{{ t('especialistas.visit') }}</option>
              <option value="VOICE">{{ t('especialistas.voice') }}</option>
              <option value="VIDEO">{{ t('especialistas.video') }}</option>
            </select>
          </label>
        </div>
        <button class="btn btn-primary mt-4" :disabled="busy" @click="submitSlot">{{ t('agenda.create') }}</button>
      </section>

      <section class="card">
        <h2>{{ t('agenda.incoming') }}</h2>
        <div v-if="!upcomingBookings.length" class="text-muted text-sm">{{ t('agenda.no_bookings') }}</div>
        <div v-for="b in upcomingBookings" :key="b.id" class="border-b border-border py-3">
          <div class="flex justify-between items-center gap-3 flex-wrap">
            <div>
              <strong>{{ b.clientName || b.clientId }}</strong>
              <div class="text-muted text-sm">{{ fmt(b.startsAt) }} · {{ t(`especialistas.${b.modality === 'VISIT' ? 'visit' : b.modality === 'VOICE' ? 'voice' : 'video'}`) }}</div>
              <div v-if="b.notes" class="text-muted text-sm italic">“{{ b.notes }}”</div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge" :class="b.status === 'CONFIRMED' ? 'ok' : 'warn'">{{ b.status }}</span>
              <template v-if="b.status === 'PENDING'">
                <button class="btn btn-primary text-sm" @click="confirmBooking(b.id)">{{ t('agenda.confirm') }}</button>
                <button class="btn btn-danger text-sm" @click="rejectBooking(b.id)">{{ t('agenda.reject') }}</button>
              </template>
              <button v-else-if="b.status === 'CONFIRMED'" class="btn text-sm" @click="completeBooking(b.id)">{{ t('agenda.complete') }}</button>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>{{ t('agenda.my_slots') }}</h2>
        <div v-if="!mySlots.length" class="text-muted text-sm">{{ t('agenda.no_slots') }}</div>
        <div v-for="s in mySlots" :key="s.id" class="flex justify-between items-center gap-3 flex-wrap border-b border-border py-2">
          <div>
            {{ fmt(s.startsAt) }} · {{ t(`especialistas.${s.modality === 'VISIT' ? 'visit' : s.modality === 'VOICE' ? 'voice' : 'video'}`) }}
            <span v-if="s.isBooked" class="badge warn ml-2">{{ t('agenda.booked') }}</span>
          </div>
          <button
            v-if="!s.isBooked && new Date(s.startsAt).getTime() > Date.now()"
            class="btn btn-danger text-sm"
            :disabled="deleting !== null"
            @click="removeSlot(s.id)"
          >{{ t('agenda.delete') }}</button>
        </div>
      </section>

      <section v-if="pastBookings.length" class="card">
        <h2>{{ t('agenda.history') }}</h2>
        <div v-for="b in pastBookings" :key="b.id" class="flex justify-between items-center gap-3 flex-wrap border-b border-border py-2">
          <div>
            <strong>{{ b.clientName || b.clientId }}</strong>
            <div class="text-muted text-sm">{{ fmt(b.startsAt) }}</div>
          </div>
          <span class="badge" :class="b.status === 'COMPLETED' ? 'ok' : 'bad'">{{ b.status }}</span>
        </div>
      </section>
    </template>
  </div>
</template>
