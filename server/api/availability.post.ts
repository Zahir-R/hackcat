import { state } from '../data/state'
import type { AvailabilitySlot } from '../../app/types'

const MODALITIES = ['VISIT', 'VOICE', 'VIDEO'] as const

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const prof = state.specialists.find(s => s.profileId === email && s.status === 'APPROVED')
  if (!prof) throw createError({ statusCode: 403, statusMessage: 'sin_perfil_aprobado' })

  const starts = new Date(String(body?.startsAt ?? ''))
  const ends = new Date(String(body?.endsAt ?? ''))
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) {
    throw createError({ statusCode: 400, statusMessage: 'Franja no válida' })
  }
  const modality = MODALITIES.includes(body?.modality) ? body.modality : 'VISIT'

  const slot: AvailabilitySlot = {
    id: `sl-${crypto.randomUUID()}`,
    professionalId: prof.id,
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
    modality,
    isBooked: false,
  }
  state.slots.push(slot)
  return slot
})
