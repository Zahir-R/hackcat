<script setup lang="ts">
const { t } = useI18n()
const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')

function submit() {
  try {
    login(email.value, password.value)
    navigateTo('/perfil')
  } catch (e) {
    error.value = t('auth.login_error')
  }
}
</script>

<template>
  <div class="flex justify-center pt-4">
    <form class="card w-[min(420px,100%)]" @submit.prevent="submit">
      <h1>{{ t('auth.login') }}</h1>
      <label>{{ t('auth.email') }}
        <input v-model="email" type="email" class="input" required />
      </label>
      <label>{{ t('auth.password') }}
        <input v-model="password" type="password" class="input" required />
      </label>
      <p v-if="error" class="field-error">{{ error }}</p>
      <button class="btn btn-primary" type="submit">{{ t('auth.login_cta') }}</button>
      <p class="text-muted text-sm mt-4">
        {{ t('auth.no_account') }}
        <NuxtLink to="/auth/register">{{ t('auth.register') }}</NuxtLink>
      </p>
    </form>
  </div>
</template>
