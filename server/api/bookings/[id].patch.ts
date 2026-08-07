import { state } from '../../data/state'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const user = state.users.find(u => u.email === email)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'no_session' })

  const booking = state.bookings.find(b => b.id === id)
  if (!booking) throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada' })

  const prof = state.specialists.find(s => s.id === booking.professionalId)
  const isProfessional = prof?.profileId === user.id
  const isClient = booking.clientId === user.id
  if (!isClient && !isProfessional) throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  const freeSlot = () => {
    const slot = state.slots.find(s => s.id === booking.slotId)
    if (slot) slot.isBooked = false
  }

  const action = String(body?.action ?? '')
  switch (action) {
    case 'confirm':
      if (!isProfessional) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
      if (booking.status !== 'PENDING') throw createError({ statusCode: 409, statusMessage: 'estado_invalido' })
      booking.status = 'CONFIRMED'
      break
    case 'reject':
      if (!isProfessional) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
      if (booking.status !== 'PENDING') throw createError({ statusCode: 409, statusMessage: 'estado_invalido' })
      booking.status = 'CANCELLED'
      freeSlot()
      break
    case 'complete':
      if (!isProfessional) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
      if (booking.status !== 'CONFIRMED') throw createError({ statusCode: 409, statusMessage: 'estado_invalido' })
      booking.status = 'COMPLETED'
      break
    case 'cancel':
      if (!isClient) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
      if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
        throw createError({ statusCode: 409, statusMessage: 'estado_invalido' })
      }
      booking.status = 'CANCELLED'
      freeSlot()
      break
    default:
      throw createError({ statusCode: 400, statusMessage: 'Acción no válida' })
  }
  return booking
})
