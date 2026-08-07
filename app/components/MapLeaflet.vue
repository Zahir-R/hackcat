<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Specialist } from '~/types'
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import { faScaleBalanced } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
  specialists: Specialist[]
  center: { lat: number; lng: number }
}>()

const emit = defineEmits<{ (e: 'select', id: string): void }>()
const el = ref<HTMLDivElement | null>(null)
const map = shallowRef<L.Map | null>(null)
const markers = shallowRef<L.Marker[]>([])

let icon: L.DivIcon
if (typeof window !== 'undefined') {
  icon = L.divIcon({
    className: 'sp-marker',
    html: `<div class="sp-marker-dot">${faIcon(faScaleBalanced).html[0]}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

onMounted(() => {
  if (!el.value || typeof window === 'undefined') return
  map.value = L.map(el.value, { scrollWheelZoom: false }).setView([props.center.lat, props.center.lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)
  renderMarkers()
})

watch(() => props.specialists, renderMarkers)
watch(() => props.center, (c) => { map.value?.setView([c.lat, c.lng], 13) })

function renderMarkers() {
  if (!map.value || typeof window === 'undefined') return
  markers.value.forEach(m => m.remove())
  const arr = props.specialists.map((s) => {
    const m = L.marker([s.lat, s.lng], { icon }).addTo(map.value!)
    m.on('click', () => emit('select', s.id))
    return m
  })
  markers.value = arr
  if (arr.length > 0) {
    const bounds = L.latLngBounds(arr.map(m => m.getLatLng()))
    map.value.fitBounds(bounds.pad(0.3))
  }
}

onBeforeUnmount(() => { map.value?.remove() })
</script>

<template>
  <div class="relative rounded-[var(--radius)] overflow-hidden border border-border">
    <div ref="el" class="relative z-0 h-[420px] w-full" />
  </div>
</template>

<style>
.map-wrap .leaflet-top, .map-wrap .leaflet-bottom { z-index: 1; }
.sp-marker-dot {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; box-shadow: var(--shadow-card); font-size: 1rem;
}
.sp-marker-dot svg {
  width: 1.1rem; height: 1.1rem;
}
</style>
