import { state } from '../../data/state'
import { toProfile } from '../../utils/profile'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  const user = state.users.find(u => u.email === email)
  if (!user || user.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'invalid_credentials' })
  }
  return toProfile(user)
})
