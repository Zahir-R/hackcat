<script setup lang="ts">
const { t } = useI18n()
const { user, isLoggedIn, isProfessional, myApplication, update, logout } = useAuth()
const { myBookings } = useBookings()

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

onMounted(() => {
  if (!isLoggedIn.value) navigateTo('/auth/login')
})

function save() {
  update({
    displayName: form.displayName,
    phone: form.phone,
    birthDate: form.birthDate,
  })
  editing.value = false
}

function fmt(s: string) {
  return new Date(s).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="user">
    <h1>{{ t('perfil.title') }}</h1>

    <div class="card">
      <div class="spread">
        <div>
          <strong>{{ user.displayName }}</strong>
          <div class="muted">{{ user.email }}</div>
          <div class="muted">{{ t('modo.' + user.ageMode) }}</div>
        </div>
        <button @click="editing = !editing">{{ editing ? t('perfil.save') : t('perfil.edit') }}</button>
      </div>

      <form v-if="editing" @submit.prevent="save">
        <label>{{ t('auth.name') }}
          <input v-model="form.displayName" required />
        </label>
        <label>{{ t('auth.phone') }}
          <input v-model="form.phone" type="tel" />
        </label>
        <label>{{ t('auth.birth') }}
          <input v-model="form.birthDate" type="date" required />
        </label>
        <button class="primary" type="submit">{{ t('perfil.save') }}</button>
      </form>
    </div>

    <div class="card">
      <div class="spread">
        <strong>{{ t('profesional.title') }}</strong>
        <NuxtLink v-if="!isProfessional" to="/perfil/profesional" class="primary btn-link">
          {{ t('perfil.apply_professional') }}
        </NuxtLink>
      </div>
      <p v-if="myApplication" class="mt">
        <span class="badge" :class="myApplication.status === 'APPROVED' ? 'ok' : myApplication.status === 'REJECTED' ? 'bad' : 'warn'">
          {{ t(`perfil.status.${myApplication.status}`) }}
        </span>
        <span v-if="myApplication.rejectionReason" class="muted"> — {{ myApplication.rejectionReason }}</span>
      </p>
      <p v-if="myApplication?.status === 'REJECTED'" class="mt">
        <NuxtLink to="/perfil/profesional" class="btn-link">{{ t('perfil.resubmit') }}</NuxtLink>
      </p>
    </div>

    <div class="card">
      <h2>{{ t('perfil.bookings') }}</h2>
      <div v-if="!myBookings.length" class="muted">—</div>
      <div v-for="b in myBookings" :key="b.id" class="spread" style="border-bottom: 1px solid var(--color-border); padding: 0.5rem 0">
        <div>
          <strong>{{ b.professionalName }}</strong>
          <div class="muted">{{ fmt(b.startsAt) }} · {{ t(`especialistas.${b.modality === 'VISIT' ? 'visit' : b.modality === 'VOICE' ? 'voice' : 'video'}`) }}</div>
        </div>
        <span class="badge" :class="b.status === 'CONFIRMED' ? 'ok' : b.status === 'CANCELLED' ? 'bad' : 'warn'">{{ b.status }}</span>
      </div>
    </div>

    <button class="danger" @click="logout(); navigateTo('/')">{{ t('nav.salir') }}</button>
  </div>
</template>

<style scoped>
.btn-link { text-decoration: none; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 8px; background: var(--color-primary); color: #fff; }
</style>
