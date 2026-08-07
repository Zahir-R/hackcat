import { state, ADMIN_EMAIL } from '../data/state'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const email = String(q.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'no_session' })
  if (user.email === ADMIN_EMAIL) {
    return [...state.applications].reverse()
  }
  return state.applications.filter(a => a.profileId === user.id)
})
