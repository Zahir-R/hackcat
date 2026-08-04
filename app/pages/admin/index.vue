<script setup lang="ts">
const { t } = useI18n()
const { isAdmin, applications, approve, reject } = useAuth()
const { items, fetchFaq } = useFaq()

const rejectId = ref<string | null>(null)
const rejectReason = ref('')

onMounted(() => {
  if (!isAdmin.value) navigateTo('/')
  fetchFaq()
})

const pending = computed(() => applications.value.filter(a => a.status === 'PENDING'))

function confirmReject() {
  if (!rejectId.value) return
  reject(rejectId.value, rejectReason.value)
  rejectId.value = null
  rejectReason.value = ''
}

const faqStats = computed(() => ({
  total: items.value.length,
  porModo: Object.fromEntries(
    ['CHILD', 'ADULT', 'ELDER'].map(m => [m, items.value.filter(i => i.ageMode === m || i.ageMode === 'ALL').length]),
  ),
}))
</script>

<template>
  <div>
    <h1>{{ t('admin.title') }}</h1>

    <section class="card">
      <h2>{{ t('admin.approvals') }}</h2>
      <div v-if="!pending.length" class="muted">{{ t('admin.empty') }}</div>
      <div v-for="a in pending" :key="a.id" class="app-row">
        <div>
          <strong>{{ a.headline }}</strong>
          <div class="muted">{{ a.roles.join(', ') }} · {{ a.experienceYears }} años · {{ a.city }}</div>
          <p>{{ a.bio }}</p>
          <div>
            <span v-for="l in a.languages" :key="l" class="pill">{{ l }}</span>
          </div>
        </div>
        <div class="row">
          <button class="primary" @click="approve(a.id)">{{ t('admin.approve') }}</button>
          <button class="danger" @click="rejectId = a.id">{{ t('admin.reject') }}</button>
        </div>
      </div>

      <div v-if="rejectId" class="card mt">
        <label>{{ t('admin.reason') }}
          <input v-model="rejectReason" />
        </label>
        <button class="danger mt" @click="confirmReject">{{ t('admin.reject') }}</button>
      </div>
    </section>

    <section class="card">
      <h2>{{ t('admin.faq') }}</h2>
      <p>Total de ítems: <strong>{{ faqStats.total }}</strong></p>
      <div class="row">
        <span v-for="(count, mode) in faqStats.porModo" :key="mode" class="pill">
          {{ mode }}: {{ count }}
        </span>
      </div>
      <p class="muted">La edición de FAQ se administra en la base de datos (`faq_categories` / `faq_items`).</p>
    </section>
  </div>
</template>

<style scoped>
.app-row {
  border-bottom: 1px solid var(--color-border);
  padding: 0.8rem 0;
  display: flex; gap: 1rem; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;
}
</style>
