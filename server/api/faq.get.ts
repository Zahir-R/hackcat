import { faqCategories } from '../data/mock'

export default defineEventHandler(() =>
  faqCategories.flatMap(cat => cat.items.map(item => ({ ...item, categoryLabel: cat.label }))),
)
