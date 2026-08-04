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
  <div class="auth-wrap">
    <form class="card" @submit.prevent="submit">
      <h1>{{ t('auth.login') }}</h1>
      <label>{{ t('auth.email') }}
        <input v-model="email" type="email" required />
      </label>
      <label>{{ t('auth.password') }}
        <input v-model="password" type="password" required />
      </label>
      <p v-if="error" class="field-error">{{ error }}</p>
      <button class="primary" type="submit">{{ t('auth.login_cta') }}</button>
      <p class="muted mt">
        {{ t('auth.no_account') }}
        <NuxtLink to="/auth/register">{{ t('auth.register') }}</NuxtLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-wrap { display: flex; justify-content: center; padding-top: 1rem; }
.auth-wrap form { width: min(420px, 100%); }
</style>
