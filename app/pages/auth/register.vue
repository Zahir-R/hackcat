<script setup lang="ts">
const { t } = useI18n()
const { register, user } = useAuth()
const { birthDate, setBirthDate, ageMode } = useAgeMode()

const email = ref('')
const password = ref('')
const displayName = ref('')
const phone = ref('')
const isProfessional = ref(false)
const error = ref('')

function submit() {
  try {
    register({
      email: email.value,
      password: password.value,
      displayName: displayName.value,
      birthDate: birthDate.value,
      phone: phone.value,
      isProfessional: isProfessional.value,
    })
    if (ageMode.value === 'CHILD') navigateTo('/auth/guardian')
    else if (isProfessional.value) navigateTo('/perfil/profesional')
    else navigateTo('/perfil')
  } catch (e) {
    error.value = e instanceof Error && e.message === 'email_exists'
      ? t('auth.email_exists')
      : String(e)
  }
}
</script>

<template>
  <div class="auth-wrap">
    <form class="card" @submit.prevent="submit">
      <h1>{{ t('auth.register') }}</h1>

      <label>{{ t('auth.name') }}
        <input v-model="displayName" required />
      </label>
      <label>{{ t('auth.email') }}
        <input v-model="email" type="email" required />
      </label>
      <label>{{ t('auth.password') }}
        <input v-model="password" type="password" minlength="6" required />
      </label>

      <div class="mt">
        <strong>{{ t('auth.birth') }}</strong>
        <ProfileScroller :model-value="birthDate" @update:model-value="setBirthDate" />
      </div>

      <label>{{ t('auth.phone') }}
        <input v-model="phone" type="tel" />
      </label>

      <label class="check">
        <input v-model="isProfessional" type="checkbox" />
        {{ t('auth.isProfessional') }}
      </label>

      <p v-if="error" class="field-error">{{ error }}</p>
      <button class="primary" type="submit">{{ t('auth.register_cta') }}</button>

      <p class="muted mt">
        {{ t('auth.have_account') }}
        <NuxtLink to="/auth/login">{{ t('auth.login') }}</NuxtLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-wrap { display: flex; justify-content: center; padding-top: 1rem; }
.auth-wrap form { width: min(460px, 100%); }
.check { display: flex; align-items: center; gap: 0.5rem; font-weight: 400; }
.check input { width: auto; min-height: 24px; }
</style>
