<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const id = route.params.id as string
const { findTopic } = useForum()
const { isLoggedIn } = useAuth()

const reply = ref('')

const topic = computed(() => findTopic(id))

function addReply() {
  if (!topic.value || !reply.value.trim()) return
  topic.value.replies.push({
    id: crypto.randomUUID(),
    authorName: 'Tú',
    body: reply.value,
    createdAt: new Date().toISOString(),
    hidden: false,
  })
  reply.value = ''
}

function fmt(s: string) {
  return new Date(s).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="topic">
    <NuxtLink to="/comunidad" class="text-muted text-sm">← {{ t('comunidad.back') }}</NuxtLink>
    <div class="card">
      <h1 class="mt-2">
        {{ topic.title }}
        <span v-if="topic.status === 'LOCKED'" class="badge warn">{{ t('comunidad.locked') }}</span>
      </h1>
      <p>{{ topic.body }}</p>
      <div class="text-muted text-sm">{{ topic.authorName }} · {{ fmt(topic.createdAt) }}</div>
    </div>

    <div v-for="r in topic.replies.filter(x => !x.hidden)" :key="r.id" class="card bg-bg">
      <p>{{ r.body }}</p>
      <div class="text-muted text-sm">{{ r.authorName }} · {{ fmt(r.createdAt) }}</div>
    </div>

    <form v-if="isLoggedIn && topic.status !== 'LOCKED'" class="card" @submit.prevent="addReply">
      <textarea v-model="reply" rows="2" class="input" :placeholder="t('comunidad.post')" />
      <button class="btn btn-primary mt-4" type="submit">{{ t('comunidad.post') }}</button>
    </form>
  </div>
</template>
