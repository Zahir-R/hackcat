<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const date = computed(() => {
  const d = new Date(props.modelValue)
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
})

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate()
}

function set(part: 'y' | 'm' | 'd', delta: number) {
  const { y, m, d } = date.value
  let ny = y, nm = m, nd = d
  if (part === 'y') ny = clamp(y + delta, 1900, new Date().getFullYear())
  if (part === 'm') {
    nm += delta
    if (nm < 1) { nm = 12; ny-- }
    if (nm > 12) { nm = 1; ny++ }
  }
  if (part === 'd') {
    nd = clamp(d + delta, 1, daysInMonth(ny, nm))
  }
  nd = Math.min(nd, daysInMonth(ny, nm))
  emit('update:modelValue', new Date(ny, nm - 1, nd).toISOString().slice(0, 10))
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const ageMode = computed(() => deriveAgeMode(props.modelValue))

const labels = computed(() => ({
  y: date.value.y, m: date.value.m, d: date.value.d,
}))
</script>

<template>
  <div class="scroller">
    <div class="wheel">
      <button class="wheel-btn" aria-label="Año -" @click="set('y', -1)">−</button>
      <div class="wheel-val">{{ labels.y }}</div>
      <button class="wheel-btn" aria-label="Año +" @click="set('y', 1)">+</button>
      <span class="wheel-label">Año</span>
    </div>
    <div class="wheel">
      <button class="wheel-btn" aria-label="Mes -" @click="set('m', -1)">−</button>
      <div class="wheel-val">{{ labels.m }}</div>
      <button class="wheel-btn" aria-label="Mes +" @click="set('m', 1)">+</button>
      <span class="wheel-label">Mes</span>
    </div>
    <div class="wheel">
      <button class="wheel-btn" aria-label="Día -" @click="set('d', -1)">−</button>
      <div class="wheel-val">{{ labels.d }}</div>
      <button class="wheel-btn" aria-label="Día +" @click="set('d', 1)">+</button>
      <span class="wheel-label">Día</span>
    </div>
  </div>
  <p class="mode-pill" :data-mode="ageMode">
    {{ $t(`modo.${ageMode}`) }} — {{ $t('modo.hint') }}
  </p>
</template>

<style scoped>
.scroller { display: flex; justify-content: center; gap: 1rem; margin: 1rem 0; }
.wheel { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.wheel-btn { min-height: 44px; min-width: 56px; font-size: 1.2rem; }
.wheel-val { font-size: 2rem; font-weight: 800; min-width: 64px; text-align: center; }
.wheel-label { color: var(--color-muted); font-size: 0.85rem; }
.mode-pill { text-align: center; font-weight: 700; color: var(--color-primary); }
</style>
