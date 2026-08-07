import { state, ADMIN_EMAIL, upsertSpecialistFromApplication } from '../../data/state'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user || user.email !== ADMIN_EMAIL) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  const app = state.applications.find(a => a.id === id)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada' })

  const action = String(body?.action ?? '')
  if (action === 'approve') {
    app.status = 'APPROVED'
    app.rejectionReason = undefined
    upsertSpecialistFromApplication(app)
  } else if (action === 'reject') {
    app.status = 'REJECTED'
    app.rejectionReason = String(body?.reason ?? '')
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Acción no válida' })
  }
  return app
})
