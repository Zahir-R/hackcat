import { forumTopics } from '../../../data/mock'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const topic = forumTopics.find(t => t.id === id && t.status !== 'HIDDEN')
  if (!topic) throw createError({ statusCode: 404, statusMessage: 'Tema no encontrado' })
  return topic
})
