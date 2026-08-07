import { state } from '../../data/state'

export default defineEventHandler(async (event) => {
  const slotId = getRouterParam(event, 'slotId')
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const prof = state.specialists.find(s => s.profileId === email)
  if (!prof) throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  const slot = state.slots.find(s => s.id === slotId)
  if (!slot || slot.professionalId !== prof.id) {
    throw createError({ statusCode: 404, statusMessage: 'Franja no encontrada' })
  }
  if (slot.isBooked) throw createError({ statusCode: 409, statusMessage: 'franja_reservada' })
  if (new Date(slot.startsAt).getTime() <= Date.now()) {
    throw createError({ statusCode: 409, statusMessage: 'franja_pasada' })
  }
  state.slots = state.slots.filter(s => s.id !== slotId)
  return { ok: true }
})
