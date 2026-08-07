<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

const props = withDefaults(defineProps<{
  modelValue?: { lat: number; lng: number } | null
  center?: { lat: number; lng: number } | null
}>(), {
  modelValue: null,
  center: null,
})

const emit = defineEmits<{ (e: 'update:modelValue', value: { lat: number; lng: number } | null): void }>()

const el = ref<HTMLDivElement | null>(null)
const map = shallowRef<L.Map | null>(null)
const marker = shallowRef<L.Marker | null>(null)

let icon: L.DivIcon
if (typeof window !== 'undefined') {
  icon = L.divIcon({
    className: 'sp-marker',
    html: `<div class="sp-marker-dot picker">${faIcon(faLocationDot).html[0]}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

function toLatLng(v: { lat: number; lng: number } | null): L.LatLng | null {
  if (!v) return null
  const ll = L.latLng(v.lat, v.lng)
  return ll.isValid() ? ll : null
}

function round(ll: L.LatLng): { lat: number; lng: number } {
  return { lat: Math.round(ll.lat * 1e5) / 1e5, lng: Math.round(ll.lng * 1e5) / 1e5 }
}

onMounted(() => {
  if (!el.value || typeof window === 'undefined') return
  const initial = toLatLng(props.modelValue) ?? toLatLng(props.center) ?? L.latLng(-19.0333, -65.2627)
  map.value = L.map(el.value, { scrollWheelZoom: false }).setView([initial.lat, initial.lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)
  requestAnimationFrame(() => map.value?.invalidateSize())

  map.value.on('click', (e: L.LeafletMouseEvent) => {
    placeMarker(e.latlng, true)
  })

  if (props.modelValue) {
    const ll = toLatLng(props.modelValue)
    if (ll) placeMarker(ll, false)
  }
})

watch(() => props.modelValue, (v) => {
  const ll = toLatLng(v)
  if (!ll || !map.value) return
  const cur = marker.value?.getLatLng()
  if (cur && Math.abs(cur.lat - ll.lat) < 1e-5 && Math.abs(cur.lng - ll.lng) < 1e-5) return
  placeMarker(ll, false)
  map.value.setView([ll.lat, ll.lng], map.value.getZoom())
})

watch(() => props.center, (c) => {
  const ll = toLatLng(c)
  if (ll && map.value) map.value.setView([ll.lat, ll.lng], 13)
})

function placeMarker(ll: L.LatLng, notify: boolean) {
  if (!map.value) return
  marker.value?.remove()
  const m = L.marker(ll, { icon, draggable: true }).addTo(map.value)
  m.on('dragend', () => {
    const pos = m.getLatLng()
    emit('update:modelValue', round(pos))
  })
  marker.value = m
  if (notify) emit('update:modelValue', round(ll))
}

onBeforeUnmount(() => { map.value?.remove() })
</script>

<template>
  <div>
    <div class="relative rounded-[var(--radius)] overflow-hidden border border-border">
      <div ref="el" class="relative z-0 h-[300px] w-full" />
    </div>
    <p v-if="modelValue" class="text-muted text-xs mt-2">
      {{ modelValue.lat.toFixed(5) }}, {{ modelValue.lng.toFixed(5) }}
    </p>
  </div>
</template>

<style>
.sp-marker-dot.picker {
  background: var(--color-accent);
  color: #fff;
}
.sp-marker-dot svg {
  width: 1.1rem; height: 1.1rem;
}
</style>
