<script setup lang="ts">
const { t } = useI18n()
const confirmTarget = ref<{ label: string; number: string } | null>(null)

const services = computed(() => [
  { key: 'policia', label: t('emergencias.policia'), number: '110', tel: 'tel:110' },
  { key: 'bomberos', label: t('emergencias.bomberos'), number: '119', tel: 'tel:119' },
  { key: 'medicos', label: t('emergencias.medicos'), number: '118', tel: 'tel:118' },
])

const localHelp = computed(() => [
  { label: t('emergencias.slim'), number: '64-4-64-27' },
  { label: t('emergencias.felcv'), number: '64-4-51-33' },
  { label: t('emergencias.fiscalia'), number: '64-4-52-11' },
  { label: t('emergencias.defensoria'), number: '64-4-56-90' },
])

function requestCall(s: { label: string; number: string }) {
  confirmTarget.value = s
}
function callNow() {
  if (confirmTarget.value) window.location.href = `tel:${confirmTarget.value.number}`
  confirmTarget.value = null
}
</script>

<template>
  <div>
    <h1>{{ t('emergencias.title') }}</h1>
    <p class="muted">{{ t('emergencias.subtitle') }}</p>

    <div>
      <button
        v-for="s in services"
        :key="s.key"
        class="emergency"
        :class="s.key"
        @click="requestCall(s)"
      >
        {{ s.label }} — {{ s.number }}
      </button>
    </div>

    <section class="card mt">
      <h2>{{ t('emergencias.local_help') }}</h2>
      <div v-for="h in localHelp" :key="h.label" class="row spread">
        <span>{{ h.label }}</span>
        <a :href="`tel:${h.number}`" class="muted">{{ h.number }}</a>
      </div>
    </section>

    <ModalConfirm
      :open="!!confirmTarget"
      :title="t('emergencias.llamar')"
      :message="confirmTarget ? `${t('emergencias.confirm')} ${confirmTarget.label} (${confirmTarget.number})?` : ''"
      @confirm="callNow"
      @close="confirmTarget = null"
    />
  </div>
</template>
