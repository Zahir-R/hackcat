import { forumTopics } from '../../data/mock'

export default defineEventHandler(() => forumTopics.filter(t => t.status !== 'HIDDEN'))
