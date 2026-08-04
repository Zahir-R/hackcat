import type { ForumTopic } from '~/types'

export const useForum = () => {
  const topics = useState<ForumTopic[]>('jc:topics', () => [])
  const loading = useState('jc:forum-loading', () => false)

  async function fetchTopics() {
    loading.value = true
    try {
      topics.value = await $fetch<ForumTopic[]>('/api/forum/topics')
    } finally {
      loading.value = false
    }
  }

  const findTopic = (id: string) => topics.value.find(t => t.id === id) ?? null

  return { topics, loading, fetchTopics, findTopic }
}
