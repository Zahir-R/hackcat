import { state, ADMIN_EMAIL } from '../data/state'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const email = String(q.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user || user.email !== ADMIN_EMAIL) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }
  return state.users
    .map(u => ({ id: u.id, email: u.email, displayName: u.displayName, isProfessional: u.isProfessional }))
    .sort((a, b) => a.email.localeCompare(b.email))
})
