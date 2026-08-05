<script setup lang="ts">
import type { Specialist } from '~/types'
import { useCatalog } from '~/composables/useCatalog'

const { roleLabel, specialtyLabel, languageLabel } = useCatalog()
defineProps<{ specialist: Specialist }>()
</script>

<template>
  <NuxtLink :to="`/especialistas/${specialist.id}`" class="card block no-underline text-text hover:border-accent">
    <div class="flex gap-2.5 items-center">
      <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
        {{ specialist.name.charAt(0) }}
      </div>
      <div>
        <strong>{{ specialist.name }}</strong>
        <div class="text-muted text-sm">{{ specialist.headline }}</div>
      </div>
      <span v-if="specialist.distanceKm !== undefined" class="badge ok ml-auto">{{ specialist.distanceKm }} {{ $t('especialistas.distance') }}</span>
    </div>
    <p class="text-sm mt-2">{{ specialist.bio }}</p>
    <div>
      <span v-for="r in specialist.roles" :key="r" class="pill">{{ roleLabel(r) }}</span>
      <span v-for="s in specialist.specialties" :key="s" class="pill">{{ specialtyLabel(s) }}</span>
      <span v-for="l in specialist.languages" :key="l" class="pill lang">{{ languageLabel(l) }}</span>
    </div>
    <div class="mt-1">
      {{ specialist.experienceYears }} años de experiencia
    </div>
  </NuxtLink>
</template>
