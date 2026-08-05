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
    <div class="flex justify-between items-center gap-3 flex-wrap">
      <h1>{{ t('comunidad.title') }}</h1>
      <button v-if="isLoggedIn" class="btn btn-primary" @click="showForm = !showForm">{{ t('comunidad.new_topic') }}</button>
    </div>

    <form v-if="showForm" class="card" @submit.prevent="createTopic">
      <label>{{ t('comunidad.new_topic') }}
        <input v-model="title" class="input" />
      </label>
      <label>{{ t('comunidad.post') }}
        <textarea v-model="body" rows="3" class="input" />
      </label>
      <button class="btn btn-primary mt-4" type="submit">{{ t('comunidad.post') }}</button>
    </form>

    <div v-for="tp in topics" :key="tp.id" class="card">
      <NuxtLink :to="`/comunidad/${tp.id}`" class="font-bold text-lg text-text no-underline hover:text-primary-ink">
        {{ tp.title }}
        <span v-if="tp.status === 'LOCKED'" class="badge warn">{{ t('comunidad.locked') }}</span>
      </NuxtLink>
      <p class="text-muted text-sm">{{ tp.body }}</p>
      <div class="text-muted text-sm">
        {{ tp.authorName }} · {{ fmt(tp.createdAt) }} · {{ tp.replies.length }} {{ t('comunidad.replies') }}
      </div>
    </div>
  </div>
</template>
