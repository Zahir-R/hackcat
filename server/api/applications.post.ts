import { state } from '../data/state'
import type { ProfessionalApplication } from '../../app/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'no_session' })

  const { headline, bio, experienceYears, city, roles, specialties, languages } = body ?? {}
  if (!headline || !bio || !city) {
    throw createError({ statusCode: 400, statusMessage: 'Datos del perfil profesional incompletos' })
  }
  if (!Array.isArray(roles) || roles.length === 0 || !Array.isArray(languages) || languages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Selecciona al menos un rol y un idioma' })
  }

  const existing = state.applications.find(a => a.profileId === user.id)
  const app: ProfessionalApplication = {
    id: existing?.id ?? crypto.randomUUID(),
    profileId: user.id,
    name: user.displayName,
    headline: String(headline),
    bio: String(bio),
    experienceYears: Number(experienceYears ?? 0),
    city: String(city),
    roles: roles.map(String),
    specialties: Array.isArray(specialties) ? specialties.map(String) : [],
    languages: languages.map(String),
    status: 'PENDING',
    rejectionReason: undefined,
  }
  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  const hasLat = body?.lat !== undefined && body?.lat !== null && body?.lat !== ''
  const hasLng = body?.lng !== undefined && body?.lng !== null && body?.lng !== ''
  if (hasLat !== hasLng) {
    throw createError({ statusCode: 400, statusMessage: 'La ubicación requiere latitud y longitud' })
  }
  if (hasLat) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw createError({ statusCode: 400, statusMessage: 'Ubicación no válida' })
    }
    app.lat = lat
    app.lng = lng
  }
  if (existing) Object.assign(existing, app)
  else state.applications.push(app)
  user.isProfessional = true
  return app
})
