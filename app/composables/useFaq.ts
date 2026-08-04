import type { AgeMode, FaqItem } from '~/types'

interface RawFaqItem {
  id: string
  categoryId: string
  categoryLabel: string
  question: Record<string, string>
  answer: Record<string, string>
  keywords: string[]
  targetType: FaqItem['targetType']
  targetId: string
  ageMode: AgeMode | 'ALL'
}

const MIN_SCORE = 1

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function matchFaq(query: string, items: FaqItem[]): FaqItem | null {
  const qTokens = normalize(query).split(/\s+/).filter(Boolean)
  if (qTokens.length === 0) return null

  let best: FaqItem | null = null
  let bestScore = 0

  for (const item of items) {
    const corpus = normalize(`${item.question} ${item.answer}`)
    const corpusTokens = new Set(corpus.split(/\s+/))
    const keywordTokens = item.keywords.flatMap(k => normalize(k).split(/\s+/))

    let score = 0
    for (const t of qTokens) {
      if (t.length < 2) continue
      if (corpusTokens.has(t) || keywordTokens.includes(t)) score += 1
      else if ([...corpusTokens, ...keywordTokens].some(k => k.includes(t))) score += 0.5
    }
    if (score > bestScore) { bestScore = score; best = item }
  }

  return bestScore >= MIN_SCORE ? best : null
}

export function resolveFaqLink(item: FaqItem): string {
  switch (item.targetType) {
    case 'PAGE': return `/${item.targetId}`
    case 'FORUM_TOPIC': return `/comunidad/${item.targetId}`
    case 'PROFILE': return `/especialistas/${item.targetId}`
    case 'SPECIALISTS_FILTER': {
      try {
        const q = JSON.parse(item.targetId) as Record<string, string>
        const params = new URLSearchParams(q)
        return `/especialistas?${params.toString()}`
      } catch {
        return `/especialistas`
      }
    }
  }
}

export const useFaq = () => {
  const { ageMode } = useAgeMode()
  const { locale } = useI18n()

  const items = useState<FaqItem[]>('jc:faq', () => [])
  const loading = useState('jc:faq-loading', () => false)

  async function fetchFaq() {
    loading.value = true
    try {
      const raw = await $fetch<RawFaqItem[]>('/api/faq')
      items.value = raw.map(r => ({
        id: r.id,
        categoryId: r.categoryId,
        categoryLabel: r.categoryLabel,
        question: r.question[locale.value] ?? r.question.es,
        answer: r.answer[locale.value] ?? r.answer.es,
        keywords: r.keywords,
        targetType: r.targetType,
        targetId: r.targetId,
        ageMode: r.ageMode,
      }))
    } finally {
      loading.value = false
    }
  }

  const categories = computed(() => {
    const map = new Map<string, { id: string; label: string; items: FaqItem[] }>()
    for (const it of items.value) {
      if (!map.has(it.categoryId)) map.set(it.categoryId, { id: it.categoryId, label: it.categoryLabel, items: [] })
      map.get(it.categoryId)!.items.push(it)
    }
    return [...map.values()]
  })

  const visibleItems = computed(() =>
    items.value.filter(i => i.ageMode === 'ALL' || i.ageMode === ageMode.value),
  )

  const findItem = (id: string) => items.value.find(i => i.id === id) ?? null

  return { items, categories, visibleItems, loading, fetchFaq, findItem }
}
