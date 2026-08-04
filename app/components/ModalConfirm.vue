<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  message: string
}>()
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal card">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="row" style="justify-content: flex-end">
            <button @click="emit('close')">{{ $t('emergencias.cancelar') }}</button>
            <button class="primary" @click="emit('confirm')">{{ $t('emergencias.llamar') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem;
}
.modal { width: min(420px, 100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
