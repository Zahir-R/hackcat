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
      <div v-if="open" class="fixed inset-0 bg-black/45 flex items-center justify-center z-[3000] p-4" @click.self="emit('close')">
        <div class="card w-[min(420px,100%)]">
          <h3 class="m-0">{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="flex gap-3 items-center justify-end">
            <button class="btn" @click="emit('close')">{{ $t('emergencias.cancelar') }}</button>
            <button class="btn btn-primary" @click="emit('confirm')">{{ $t('emergencias.llamar') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
