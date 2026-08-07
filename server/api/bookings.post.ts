import { state } from '../data/state'
import type { Booking } from '../../app/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'no_session' })

  const slotId = String(body?.slotId ?? '')
  const slot = state.slots.find(s => s.id === slotId)
  if (!slot) throw createError({ statusCode: 404, statusMessage: 'franja_no_encontrada' })
  if (slot.isBooked || new Date(slot.startsAt).getTime() <= Date.now()) {
    throw createError({ statusCode: 409, statusMessage: 'franja_ocupada' })
  }

  const prof = state.specialists.find(s => s.id === slot.professionalId)
  if (!prof || prof.status !== 'APPROVED') {
    throw createError({ statusCode: 404, statusMessage: 'Profesional no encontrado' })
  }

  slot.isBooked = true
  const booking: Booking = {
    id: crypto.randomUUID(),
    clientId: user.id,
    professionalId: prof.id,
    professionalName: prof.name,
    slotId: slot.id,
    startsAt: slot.startsAt,
    modality: slot.modality,
    status: 'PENDING',
    notes: String(body?.notes ?? ''),
  }
  state.bookings.push(booking)
  return booking
})
