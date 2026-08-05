<script setup lang="ts">
import type { FaqItem } from '~/types'
import { matchFaq, resolveFaqLink } from '~/composables/useFaq'

const { t } = useI18n()
const { categories, visibleItems, fetchFaq, findItem } = useFaq()

interface Msg {
  role: 'user' | 'assistant'
  content: string
  link?: { label: string; to: string }
  itemId?: string
}

const open = ref(false)
const view = ref<'menu' | 'category' | 'answer'>('menu')
const activeCategory = ref<string | null>(null)
const selectedItem = ref<FaqItem | null>(null)
const input = ref('')
const messages = ref<Msg[]>([])
const typing = ref(false)

watch(open, (v) => {
  if (v && messages.value.length === 0) {
    messages.value.push({ role: 'assistant', content: t('ramon.welcome') })
    view.value = 'menu'
  }
})

onMounted(() => { fetchFaq() })

const currentItems = computed(() => {
  const items = view.value === 'category' && activeCategory.value
    ? categories.value.find(c => c.id === activeCategory.value)?.items ?? []
    : visibleItems.value
  return items
})

function openCategory(id: string) {
  activeCategory.value = id
  view.value = 'category'
}

function openItem(item: FaqItem) {
  selectedItem.value = item
  messages.value.push({ role: 'assistant', content: item.question, itemId: item.id })
  messages.value.push({
    role: 'assistant',
    content: item.answer,
    link: { label: t('ramon.open_link'), to: resolveFaqLink(item) },
  })
  view.value = 'answer'
  input.value = ''
}

function askText() {
  const q = input.value.trim()
  if (!q) return
  messages.value.push({ role: 'user', content: q })
  typing.value = true
  const match = matchFaq(q, visibleItems.value)
  setTimeout(() => {
    typing.value = false
    if (match) {
      openItem(match)
    } else {
      messages.value.push({ role: 'assistant', content: t('ramon.fallback') })
      view.value = 'menu'
    }
  }, 350)
}

function backToMenu() {
  view.value = 'menu'
  activeCategory.value = null
  selectedItem.value = null
}

const panelBody = ref<HTMLElement | null>(null)
watch(() => messages.value.length, () => {
  nextTick(() => { panelBody.value?.scrollTo({ top: panelBody.value.scrollHeight, behavior: 'smooth' }) })
})

const activeItem = computed(() => view.value === 'answer' && selectedItem.value ? selectedItem.value : null)
</script>

<template>
  <Teleport to="body">
    <div class="fixed right-4 bottom-4 z-[2000]">
      <Transition name="pop">
        <div v-if="open" class="card w-[min(380px,calc(100vw-2rem))] mb-2.5 flex flex-col p-0 overflow-hidden max-h-[min(70vh,560px)]">
          <div class="flex justify-between items-center px-4 py-2.5 bg-primary text-white">
            <strong>🤖 {{ t('ramon.name') }}</strong>
            <button class="border-none bg-transparent text-white min-h-9" @click="open = false" aria-label="Cerrar">✕</button>
          </div>

          <div ref="panelBody" class="p-3 overflow-y-auto flex-1">
            <div v-for="(m, i) in messages" :key="i" class="flex mb-2" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[85%] px-3 py-2.5 rounded-xl bg-[#F0D3A8] text-primary-dark">
                <p class="m-0">{{ m.content }}</p>
                <NuxtLink v-if="m.link" :to="m.link.to" class="inline-block mt-1 text-accent font-bold no-underline" @click="open = false">
                  {{ m.link.label }} →
                </NuxtLink>
              </div>
            </div>
            <div v-if="typing" class="flex justify-start mb-2"><div class="max-w-[85%] px-3 py-2.5 rounded-xl bg-[#F0D3A8] text-primary-dark">…</div></div>

            <div class="mt-1">
              <div v-if="view === 'menu'" class="flex flex-col gap-1">
                <button v-for="c in categories" :key="c.id" class="chip-tag text-left min-h-11" @click="openCategory(c.id)">
                  {{ c.label }}
                </button>
              </div>
              <div v-else-if="view === 'category'" class="flex flex-col gap-1">
                <button class="chip-tag text-left min-h-11" @click="backToMenu">← {{ t('ramon.back') }}</button>
                <button
                  v-for="it in currentItems"
                  :key="it.id"
                  class="chip-tag text-left min-h-11"
                  @click="openItem(it)"
                >
                  {{ it.question }}
                </button>
              </div>
              <div v-else class="flex flex-col gap-1">
                <button class="chip-tag text-left min-h-11" @click="backToMenu">← {{ t('ramon.back') }}</button>
              </div>
            </div>
          </div>

          <form class="flex gap-1 p-2.5 border-t border-border" @submit.prevent="askText">
            <input
              v-model="input"
              class="input min-h-11"
              :placeholder="t('ramon.placeholder')"
              :disabled="typing"
            />
            <button class="btn btn-primary min-h-11 min-w-11" type="submit" :disabled="typing">➤</button>
          </form>
        </div>
      </Transition>

      <button class="btn btn-accent rounded-full shadow-card font-bold float-right" @click="open = !open" aria-label="Abrir Ramon">
        <span v-if="!open">🤖 {{ t('ramon.name') }}</span>
        <span v-else>✕</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.pop-enter-active, .pop-leave-active { transition: all 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(10px); }
</style>
