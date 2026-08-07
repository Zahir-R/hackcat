import { state } from '../data/state'
import { deriveAgeMode } from '../utils/age'
import { toProfile } from '../utils/profile'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'no_session' })

  if (body.displayName !== undefined) user.displayName = String(body.displayName)
  if (body.phone !== undefined) user.phone = String(body.phone)
  if (body.language !== undefined) user.language = String(body.language)
  if (body.isProfessional !== undefined) user.isProfessional = Boolean(body.isProfessional)
  if (body.birthDate !== undefined) {
    user.birthDate = String(body.birthDate)
    user.ageMode = deriveAgeMode(user.birthDate)
  }
  const hasLat = body.lat !== undefined && body.lat !== null && body.lat !== ''
  const hasLng = body.lng !== undefined && body.lng !== null && body.lng !== ''
  if (hasLat !== hasLng) {
    throw createError({ statusCode: 400, statusMessage: 'La ubicación requiere latitud y longitud' })
  }
  if (hasLat) {
    const lat = Number(body.lat)
    const lng = Number(body.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw createError({ statusCode: 400, statusMessage: 'Ubicación no válida' })
    }
    const prof = state.specialists.find(s => s.profileId === user.id)
    if (prof) {
      prof.lat = lat
      prof.lng = lng
    }
  }
  return toProfile(user)
})
