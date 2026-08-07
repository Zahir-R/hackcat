import { state, ADMIN_EMAIL, removeUserData } from '../../data/state'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const email = String(q.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user || user.email !== ADMIN_EMAIL) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  const target = getRouterParam(event, 'email')?.toLowerCase() ?? ''
  if (target === ADMIN_EMAIL) {
    throw createError({ statusCode: 400, statusMessage: 'no_self_delete' })
  }
  if (!removeUserData(target)) {
    throw createError({ statusCode: 404, statusMessage: 'usuario_no_encontrado' })
  }
  return { ok: true }
})
