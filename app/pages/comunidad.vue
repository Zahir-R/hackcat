<script setup lang="ts">
const { t } = useI18n()
const { topics, fetchTopics } = useForum()
const { isLoggedIn } = useAuth()

const showForm = ref(false)
const title = ref('')
const body = ref('')

onMounted(fetchTopics)

function createTopic() {
  if (!title.value.trim() || !body.value.trim()) return
  topics.value = [
    {
      id: crypto.randomUUID(),
      title: title.value,
      body: body.value,
      authorName: 'Tú',
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      replies: [],
    },
    ...topics.value,
  ]
  title.value = ''
  body.value = ''
  showForm.value = false
}

function fmt(s: string) {
  return new Date(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="spread">
      <h1>{{ t('comunidad.title') }}</h1>
      <button v-if="isLoggedIn" class="primary" @click="showForm = !showForm">{{ t('comunidad.new_topic') }}</button>
    </div>

    <form v-if="showForm" class="card" @submit.prevent="createTopic">
      <label>{{ t('comunidad.new_topic') }}
        <input v-model="title" />
      </label>
      <label>{{ t('comunidad.post') }}
        <textarea v-model="body" rows="3" />
      </label>
      <button class="primary mt" type="submit">{{ t('comunidad.post') }}</button>
    </form>

    <div v-for="tp in topics" :key="tp.id" class="card topic">
      <NuxtLink :to="`/comunidad/${tp.id}`" class="topic-title">
        {{ tp.title }}
        <span v-if="tp.status === 'LOCKED'" class="badge warn">{{ t('comunidad.locked') }}</span>
      </NuxtLink>
      <p class="muted">{{ tp.body }}</p>
      <div class="muted">
        {{ tp.authorName }} · {{ fmt(tp.createdAt) }} · {{ tp.replies.length }} {{ t('comunidad.replies') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.topic-title { font-weight: 700; font-size: 1.05rem; color: var(--color-text); text-decoration: none; }
.topic-title:hover { color: var(--color-primary); }
</style>
