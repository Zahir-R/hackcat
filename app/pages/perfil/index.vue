<script setup lang="ts">
const { t } = useI18n()
const { user, isLoggedIn, isProfessional, myApplication, update, logout, restore } = useAuth()
const { myBookings, fetchMyBookings, cancelBooking } = useBookings()

const editing = ref(false)
const form = reactive({
  displayName: '',
  phone: '',
  birthDate: '',
})

watch(user, () => {
  if (user.value) {
    form.displayName = user.value.displayName
    form.phone = user.value.phone
    form.birthDate = user.value.birthDate
  }
}, { immediate: true })

onMounted(async () => {
  await restore()
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  await fetchMyBookings()
})

async function save() {
  await update({
    displayName: form.displayName,
    phone: form.phone,
    birthDate: form.birthDate,
  })
  editing.value = false
}

async function cancel(bookingId: string) {
  await cancelBooking(bookingId)
}

function fmt(s: string) {
  return new Date(s).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="user">
    <h1>{{ t('perfil.title') }}</h1>

    <div class="card">
      <div class="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <strong>{{ user.displayName }}</strong>
          <div class="text-muted text-sm">{{ user.email }}</div>
          <div class="text-muted text-sm">{{ t('modo.' + user.ageMode) }}</div>
        </div>
        <button class="btn" @click="editing = !editing">{{ editing ? t('perfil.save') : t('perfil.edit') }}</button>
      </div>

      <form v-if="editing" @submit.prevent="save">
        <label>{{ t('auth.name') }}
          <input v-model="form.displayName" class="input" required />
        </label>
        <label>{{ t('auth.phone') }}
          <input v-model="form.phone" type="tel" class="input" />
        </label>
        <label>{{ t('auth.birth') }}
          <AgeSlider :model-value="form.birthDate" @update:model-value="v => form.birthDate = v" />
        </label>
        <button class="btn btn-primary" type="submit">{{ t('perfil.save') }}</button>
      </form>
    </div>

    <div class="card">
      <div class="flex justify-between items-center gap-3 flex-wrap">
        <strong>{{ t('profesional.title') }}</strong>
        <NuxtLink v-if="!isProfessional" to="/perfil/profesional" class="no-underline font-semibold px-3 py-2 rounded-lg bg-primary text-white">
          {{ t('perfil.apply_professional') }}
        </NuxtLink>
      </div>
      <p v-if="myApplication" class="mt-4">
        <span class="badge" :class="myApplication.status === 'APPROVED' ? 'ok' : myApplication.status === 'REJECTED' ? 'bad' : 'warn'">
          {{ t(`perfil.status.${myApplication.status}`) }}
        </span>
        <span v-if="myApplication.rejectionReason" class="text-muted text-sm"> — {{ myApplication.rejectionReason }}</span>
      </p>
      <p v-if="myApplication?.status === 'APPROVED'" class="mt-4">
        <NuxtLink to="/perfil/agenda" class="no-underline font-semibold text-primary-ink">{{ t('nav.agenda') }}</NuxtLink>
      </p>
      <p v-if="myApplication?.status === 'REJECTED'" class="mt-4">
        <NuxtLink to="/perfil/profesional" class="no-underline font-semibold text-primary-ink">{{ t('perfil.resubmit') }}</NuxtLink>
      </p>
    </div>

    <div class="card">
      <h2>{{ t('perfil.bookings') }}</h2>
      <div v-if="!myBookings.length" class="text-muted text-sm">—</div>
      <div v-for="b in myBookings" :key="b.id" class="flex justify-between items-center gap-3 flex-wrap border-b border-border py-2">
        <div>
          <strong>{{ b.professionalName }}</strong>
          <div class="text-muted text-sm">{{ fmt(b.startsAt) }} · {{ t(`especialistas.${b.modality === 'VISIT' ? 'visit' : b.modality === 'VOICE' ? 'voice' : 'video'}`) }}</div>
          <div v-if="b.status === 'CONFIRMED' && b.modality !== 'VISIT'" class="text-muted text-sm">{{ t('reservar.contact_hint') }}</div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="badge" :class="b.status === 'CONFIRMED' ? 'ok' : b.status === 'CANCELLED' ? 'bad' : 'warn'">{{ b.status }}</span>
          <button
            v-if="b.status === 'PENDING' || b.status === 'CONFIRMED'"
            class="btn btn-danger text-sm"
            @click="cancel(b.id)"
          >{{ t('perfil.cancel') }}</button>
        </div>
      </div>
    </div>

    <button class="btn btn-danger" @click="logout(); navigateTo('/')">{{ t('nav.salir') }}</button>
  </div>
</template>
