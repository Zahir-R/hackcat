<script setup lang="ts">
const { t } = useI18n()
const { user, update } = useAuth()

const consent = ref(false)
const relationship = ref('tutor_legal')

function submit() {
  if (!consent.value) return
  window.localStorage.setItem('jc_guardian', 'APPROVED')
  void update({})
  navigateTo('/')
}
</script>

<template>
  <div class="flex justify-center pt-4">
    <div class="card w-[min(440px,100%)]">
      <h1>{{ t('auth.guardian_title') }}</h1>
      <p>{{ t('auth.guardian_desc') }}</p>
      <p v-if="user" class="text-muted text-sm">{{ t('auth.guardian_tutor') }} {{ user.displayName }}</p>

      <label>{{ t('profesional.languages') }}
        <select v-model="relationship" class="input">
          <option value="tutor_legal">Tutor legal</option>
          <option value="padre">Padre</option>
          <option value="madre">Madre</option>
          <option value="abuelo">Abuelo/a</option>
        </select>
      </label>

      <label class="flex items-center gap-2 font-normal">
        <input v-model="consent" type="checkbox" class="w-auto min-h-6" />
        {{ t('auth.guardian_consent') }}
      </label>

      <button class="btn btn-primary" :disabled="!consent" @click="submit">{{ t('auth.guardian_cta') }}</button>
    </div>
  </div>
</template>
