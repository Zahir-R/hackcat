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
    <div class="ramon-widget">
      <Transition name="pop">
        <div v-if="open" class="ramon-panel card">
          <div class="ramon-head">
            <strong>🤖 {{ t('ramon.name') }}</strong>
            <button class="icon-btn" @click="open = false" aria-label="Cerrar">✕</button>
          </div>

          <div ref="panelBody" class="ramon-body">
            <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
              <div class="bubble">
                <p>{{ m.content }}</p>
                <NuxtLink v-if="m.link" :to="m.link.to" class="link-btn" @click="open = false">
                  {{ m.link.label }} →
                </NuxtLink>
              </div>
            </div>
            <div v-if="typing" class="msg assistant"><div class="bubble">…</div></div>

            <div class="ramon-actions">
              <div v-if="view === 'menu'" class="ramon-menu">
                <button v-for="c in categories" :key="c.id" class="chip-tag" @click="openCategory(c.id)">
                  {{ c.label }}
                </button>
              </div>
              <div v-else-if="view === 'category'" class="ramon-menu">
                <button class="chip-tag" @click="backToMenu">← {{ t('ramon.back') }}</button>
                <button
                  v-for="it in currentItems"
                  :key="it.id"
                  class="chip-tag"
                  @click="openItem(it)"
                >
                  {{ it.question }}
                </button>
              </div>
              <div v-else class="ramon-menu">
                <button class="chip-tag" @click="backToMenu">← {{ t('ramon.back') }}</button>
              </div>
            </div>
          </div>

          <form class="ramon-input" @submit.prevent="askText">
            <input
              v-model="input"
              :placeholder="t('ramon.placeholder')"
              :disabled="typing"
            />
            <button class="primary" type="submit" :disabled="typing">➤</button>
          </form>
        </div>
      </Transition>

      <button class="ramon-fab accent" @click="open = !open" aria-label="Abrir Ramon">
        <span v-if="!open">🤖 {{ t('ramon.name') }}</span>
        <span v-else>✕</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ramon-widget { position: fixed; right: 1rem; bottom: 1rem; z-index: 100; }
.ramon-fab {
  border-radius: 999px;
  box-shadow: var(--shadow);
  font-weight: 700;
  float: right;
}
.ramon-panel {
  width: min(380px, calc(100vw - 2rem));
  margin-bottom: 0.6rem;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  max-height: min(70vh, 560px);
}
.ramon-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.6rem 1rem;
  background: var(--color-primary); color: #fff;
}
.icon-btn { border: none; background: none; color: #fff; min-height: 36px; }
.ramon-body { padding: 0.8rem; overflow-y: auto; flex: 1; }
.msg { display: flex; margin-bottom: 0.5rem; }
.msg.assistant { justify-content: flex-start; }
.msg.user { justify-content: flex-end; }
.bubble {
  max-width: 85%;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  background: #eef4f0;
}
.bubble p { margin: 0; }
.msg.user .bubble { background: var(--color-primary); color: #fff; }
.link-btn {
  display: inline-block; margin-top: 0.4rem;
  color: var(--color-accent); font-weight: 700; text-decoration: none;
}
.ramon-actions { margin-top: 0.4rem; }
.ramon-menu { display: flex; flex-direction: column; gap: 0.4rem; }
.ramon-menu .chip-tag { text-align: left; min-height: 44px; }
.ramon-input { display: flex; gap: 0.4rem; padding: 0.6rem; border-top: 1px solid var(--color-border); }
.ramon-input input { min-height: 44px; }
.ramon-input button { min-height: 44px; min-width: 44px; }

.pop-enter-active, .pop-leave-active { transition: all 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(10px); }
</style>
