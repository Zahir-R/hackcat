import { state } from '../../data/state'

export default defineEventHandler((event) => {
  const profId = getRouterParam(event, 'profId')
  return state.slots
    .filter(s => s.professionalId === profId && !s.isBooked)
    .filter(s => new Date(s.startsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})
