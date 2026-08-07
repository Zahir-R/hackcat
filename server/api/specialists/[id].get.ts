import { state } from '../../data/state'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const spec = state.specialists.find(s => s.id === id && s.status === 'APPROVED')
  if (!spec) throw createError({ statusCode: 404, statusMessage: 'Especialista no encontrado' })
  return spec
})
