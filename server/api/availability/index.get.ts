import { state } from '../../data/state'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  if (q.mine !== '1') return []
  const email = String(q.email ?? '').trim().toLowerCase()
  const prof = state.specialists.find(s => s.profileId === email && s.status === 'APPROVED')
  if (!prof) throw createError({ statusCode: 403, statusMessage: 'sin_perfil_aprobado' })
  return state.slots
    .filter(s => s.professionalId === prof.id)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})
