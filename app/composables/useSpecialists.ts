import type { Specialist } from '~/types'

export const useSpecialists = () => {
  const specialists = useState<Specialist[]>('jc:specialists', () => [])
  const loading = useState('jc:specialists-loading', () => false)
  const error = useState<string | null>('jc:specialists-error', () => null)

  const filters = useState('jc:filters', () => ({
    rol: '' as string,
    especialidad: '' as string,
    idioma: '' as string,
    minExp: 0 as number,
    radius: 100 as number,
  }))

  const location = useState<{ lat: number; lng: number } | null>('jc:loc', () => null)

  async function fetchSpecialists() {
    loading.value = true
    error.value = null
    try {
      const q: Record<string, string | number> = {}
      if (filters.value.rol) q.rol = filters.value.rol
      if (filters.value.especialidad) q.especialidad = filters.value.especialidad
      if (filters.value.idioma) q.idioma = filters.value.idioma
      if (filters.value.minExp) q.minExp = filters.value.minExp
      if (filters.value.radius) q.radius = filters.value.radius
      if (location.value) { q.lat = location.value.lat; q.lng = location.value.lng }
      const data = await $fetch<Specialist[]>('/api/specialists', { query: q })
      specialists.value = data
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  return { specialists, loading, error, filters, location, fetchSpecialists }
}
