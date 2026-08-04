import { buildSlots } from '../../data/mock'

export default defineEventHandler((event) => {
  const profId = getRouterParam(event, 'profId')
  const slots = buildSlots()
    .filter(s => s.professionalId === profId && !s.isBooked)
    .filter(s => new Date(s.startsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return slots
})
