<script setup lang="ts">
import type { Specialist } from '~/types'

defineProps<{ specialist: Specialist }>()
</script>

<template>
  <NuxtLink :to="`/especialistas/${specialist.id}`" class="card spec-card">
    <div class="spec-head">
      <div class="avatar">{{ specialist.name.charAt(0) }}</div>
      <div>
        <strong>{{ specialist.name }}</strong>
        <div class="muted">{{ specialist.headline }}</div>
      </div>
      <span v-if="specialist.distanceKm !== undefined" class="badge ok">{{ specialist.distanceKm }} {{ $t('especialistas.distance') }}</span>
    </div>
    <p class="bio">{{ specialist.bio }}</p>
    <div>
      <span v-for="r in specialist.roles" :key="r" class="pill">{{ r }}</span>
      <span v-for="s in specialist.specialties" :key="s" class="pill">{{ s }}</span>
      <span v-for="l in specialist.languages" :key="l" class="pill lang">{{ l }}</span>
    </div>
    <div class="mt">
      {{ specialist.experienceYears }} años de experiencia
    </div>
  </NuxtLink>
</template>

<style scoped>
.spec-card { display: block; color: inherit; text-decoration: none; }
.spec-head { display: flex; gap: 0.7rem; align-items: center; }
.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 700; flex-shrink: 0;
}
.bio { font-size: 0.9rem; }
.pill.lang { background: #fdeeda; }
</style>
