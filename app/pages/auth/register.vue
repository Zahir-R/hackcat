<script setup lang="ts">
const { t } = useI18n()
const { register, isAdmin } = useAuth()
const { birthDate, setBirthDate } = useAgeMode()

const email = ref('')
const password = ref('')
const displayName = ref('')
const phone = ref('')
const isProfessional = ref(false)
const error = ref('')
const submitting = ref(false)

async function submit() {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    const me = await register({
      email: email.value,
      password: password.value,
      displayName: displayName.value,
      birthDate: birthDate.value,
      phone: phone.value,
      isProfessional: isProfessional.value,
    })
    if (isAdmin.value) navigateTo('/admin')
    else if (me.ageMode === 'CHILD') navigateTo('/auth/guardian')
    else if (me.isProfessional) navigateTo('/perfil/profesional')
    else navigateTo('/')
  } catch (e) {
    error.value = e instanceof Error && e.message === 'email_exists'
      ? t('auth.email_exists')
      : t('auth.register_error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex justify-center pt-4">
    <form class="card w-[min(460px,100%)]" @submit.prevent="submit">
      <h1>{{ t('auth.register') }}</h1>

      <label>{{ t('auth.name') }}
        <input v-model="displayName" class="input" required />
      </label>
      <label>{{ t('auth.email') }}
        <input v-model="email" type="email" class="input" required />
      </label>
      <label>{{ t('auth.password') }}
        <input v-model="password" type="password" class="input" minlength="6" required />
      </label>

      <div class="mt-4">
        <strong>{{ t('auth.birth') }}</strong>
        <AgeSlider :model-value="birthDate" @update:model-value="setBirthDate" />
      </div>

      <label>{{ t('auth.phone') }}
        <input v-model="phone" type="tel" class="input" />
      </label>

      <label class="flex items-center gap-2 font-normal">
        <input v-model="isProfessional" type="checkbox" class="w-auto min-h-6" />
        {{ t('auth.isProfessional') }}
      </label>

      <p v-if="error" class="field-error">{{ error }}</p>
      <button class="btn btn-primary w-full mt-2" type="submit" :disabled="submitting">{{ t('auth.register_cta') }}</button>

      <p class="text-muted text-sm mt-4 text-center">
        {{ t('auth.have_account') }}
        <NuxtLink to="/auth/login">{{ t('auth.login') }}</NuxtLink>
      </p>
    </form>
  </div>
</template>
