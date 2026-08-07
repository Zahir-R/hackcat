import { state } from '../data/state'
import { haversineKm } from '../utils/geo'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const lat = Number(q.lat ?? 0)
  const lng = Number(q.lng ?? 0)
  const useGeo = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
  const radiusKm = Number(q.radius ?? 0) || 100

  const roles = asArray(q.rol)
  const specialties = asArray(q.especialidad)
  const languages = asArray(q.idioma)
  const minExp = Number(q.minExp ?? 0) || 0

  const filtered = state.specialists
    .filter(s => s.status === 'APPROVED')
    .filter(s => roles.length === 0 || s.roles.some(r => roles.includes(r)))
    .filter(s => specialties.length === 0 || s.specialties.some(x => specialties.includes(x)))
    .filter(s => languages.length === 0 || s.languages.some(l => languages.includes(l)))
    .filter(s => s.experienceYears >= minExp)
    .map(s => useGeo
      ? { ...s, distanceKm: Math.round(haversineKm(lat, lng, s.lat, s.lng) * 10) / 10 }
      : s)
    .filter(s => !useGeo || (s.distanceKm ?? 0) <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))

  return filtered
})

function asArray(v: unknown): string[] {
  if (!v) return []
  return Array.isArray(v) ? v.map(String) : [String(v)]
}
