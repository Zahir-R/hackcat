import { specialists } from '../../data/mock'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const spec = specialists.find(s => s.id === id && s.status === 'APPROVED')
  if (!spec) throw createError({ statusCode: 404, statusMessage: 'Especialista no encontrado' })
  return spec
})
