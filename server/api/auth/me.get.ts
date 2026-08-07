import { state } from '../../data/state'
import { toProfile } from '../../utils/profile'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const email = String(q.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'no_session' })
  return toProfile(user)
})
