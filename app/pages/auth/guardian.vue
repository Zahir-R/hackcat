<script setup lang="ts">
const { t } = useI18n()
const { user, update } = useAuth()

const consent = ref(false)
const relationship = ref('tutor_legal')

function submit() {
  if (!consent.value) return
  window.localStorage.setItem('jc_guardian', 'APPROVED')
  update({})
  navigateTo('/perfil')
}
</script>

<template>
  <div class="auth-wrap">
    <div class="card">
      <h1>{{ t('auth.guardian_title') }}</h1>
      <p>{{ t('auth.guardian_desc') }}</p>
      <p v-if="user" class="muted">Tutor: {{ user.displayName }}</p>

      <label>{{ t('profesional.languages') }}
        <select v-model="relationship">
          <option value="tutor_legal">Tutor legal</option>
          <option value="padre">Padre</option>
          <option value="madre">Madre</option>
          <option value="abuelo">Abuelo/a</option>
        </select>
      </label>

      <label class="check">
        <input v-model="consent" type="checkbox" />
        {{ t('auth.guardian_consent') }}
      </label>

      <button class="primary" :disabled="!consent" @click="submit">{{ t('auth.guardian_cta') }}</button>
    </div>
  </div>
</template>

<style scoped>
.auth-wrap { display: flex; justify-content: center; padding-top: 1rem; }
.auth-wrap .card { width: min(440px, 100%); }
.check { display: flex; gap: 0.5rem; align-items: center; font-weight: 400; }
.check input { width: auto; min-height: 24px; }
</style>
