<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const MIN_AGE = 8
const MAX_AGE = 100

const age = computed<number>(() => {
  const v = Math.round(ageInYears(props.modelValue))
  return Number.isFinite(v) ? Math.min(MAX_AGE, Math.max(MIN_AGE, v)) : MIN_AGE
})

const ageMode = computed(() => deriveAgeMode(props.modelValue))

function onChange(e: Event) {
  const a = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', birthDateFromAge(a))
}
</script>

<template>
  <div class="my-1">
    <input
      class="w-full accent-primary h-2"
      type="range"
      :min="MIN_AGE"
      :max="MAX_AGE"
      :value="age"
      :aria-label="$t('modo.age_label')"
      @input="onChange"
    >
    <div class="flex items-baseline justify-center gap-1 mt-2.5">
      <strong class="text-[2.6rem] leading-none font-display text-primary-ink">{{ age }}</strong>
      <span class="text-muted text-sm uppercase tracking-wider">{{ $t('modo.years') }}</span>
    </div>
    <p class="text-center font-bold text-primary-ink mt-1" :data-mode="ageMode">
      {{ $t(`modo.${ageMode}`) }} — {{ $t('modo.hint') }}
    </p>
  </div>
</template>
