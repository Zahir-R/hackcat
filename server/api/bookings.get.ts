import { state } from '../data/state'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const email = String(q.email ?? '').trim().toLowerCase()
  const role = q.role === 'professional' ? 'professional' : 'client'

  let list = state.bookings
  if (role === 'professional') {
    const prof = state.specialists.find(s => s.profileId === email)
    if (!prof) return []
    list = state.bookings.filter(b => b.professionalId === prof.id)
    return list
      .map(b => ({ ...b, clientName: state.users.find(u => u.id === b.clientId)?.displayName ?? b.clientId }))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
  }

  return list
    .filter(b => b.clientId === email)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
})
