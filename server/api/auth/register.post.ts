import { state } from '../../data/state'
import type { StoredUser } from '../../../app/types'
import { deriveAgeMode } from '../../utils/age'
import { toProfile } from '../../utils/profile'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password, displayName, birthDate, phone, isProfessional } = body ?? {}
  const email = String(body?.email ?? '').trim().toLowerCase()
  if (!email || !password || !displayName || !birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Datos de registro incompletos' })
  }
  if (state.users.some(u => u.email === email)) {
    throw createError({ statusCode: 409, statusMessage: 'email_exists' })
  }

  const user: StoredUser = {
    id: email,
    email,
    password: String(password),
    displayName: String(displayName),
    birthDate: String(birthDate),
    ageMode: deriveAgeMode(String(birthDate)),
    phone: String(phone ?? ''),
    language: 'es',
    isProfessional: Boolean(isProfessional),
  }
  state.users.push(user)
  return toProfile(user)
})
