import { addBooking, specialists } from '../data/mock'
import type { Booking } from '../../app/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { slotId, modality, notes, clientName, startsAt } = body ?? {}

  if (!slotId || !modality || !startsAt) {
    throw createError({ statusCode: 400, statusMessage: 'Datos de reserva incompletos' })
  }

  const profId = String(slotId).replace(/^sl-/, '').split('-').slice(0, 2).join('-')
  const professional = specialists.find(s => s.id === profId && s.status === 'APPROVED')
  if (!professional) throw createError({ statusCode: 404, statusMessage: 'Profesional no encontrado' })

  // Deterministic mock: a slot is available if it has not been booked yet.
  const booking: Booking = {
    id: crypto.randomUUID(),
    clientId: 'demo',
    professionalId: professional.id,
    professionalName: professional.name,
    slotId,
    startsAt,
    modality,
    status: 'PENDING',
    notes: notes ?? '',
  }
  addBooking(booking)
  return booking
})
