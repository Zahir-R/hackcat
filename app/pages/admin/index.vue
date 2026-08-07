<script setup lang="ts">
const { t } = useI18n()
const { isAdmin, applications, refreshApplications, approve, reject, users, fetchUsers, deleteUser, restore } = useAuth()
const { items, fetchFaq } = useFaq()
const { roleLabel, specialtyLabel, languageLabel } = useCatalog()

const rejectId = ref<string | null>(null)
const rejectReason = ref('')
const busy = ref<string | null>(null)
const deleteTarget = ref<string | null>(null)
const deleting = ref<string | null>(null)

onMounted(async () => {
  await restore()
  if (!isAdmin.value) {
    navigateTo('/')
    return
  }
  await refreshApplications()
  await fetchFaq()
  await fetchUsers()
})

const pending = computed(() => applications.value.filter(a => a.status === 'PENDING'))

function confirmReject() {
  if (!rejectId.value) return
  void reject(rejectId.value, rejectReason.value)
  rejectId.value = null
  rejectReason.value = ''
}

async function approveOne(id: string) {
  busy.value = id
  await approve(id)
  busy.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = deleteTarget.value
  await deleteUser(deleteTarget.value)
  deleting.value = null
  deleteTarget.value = null
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
      <div v-if="!pending.length" class="text-muted text-sm">{{ t('admin.empty') }}</div>
      <div v-for="a in pending" :key="a.id" class="border-b border-border py-3 flex gap-4 justify-between items-start flex-wrap">
        <div>
          <strong>{{ a.headline }}</strong>
          <div class="text-muted text-sm">{{ a.name }} · {{ a.roles.map(roleLabel).join(', ') }} · {{ a.experienceYears }} años · {{ a.city }}</div>
          <p>{{ a.bio }}</p>
          <div>
            <span v-for="s in a.specialties" :key="s" class="pill">{{ specialtyLabel(s) }}</span>
            <span v-for="l in a.languages" :key="l" class="pill lang">{{ languageLabel(l) }}</span>
          </div>
        </div>
        <div class="flex gap-3 items-center flex-wrap">
          <button class="btn btn-primary" :disabled="busy !== null" @click="approveOne(a.id)">{{ t('admin.approve') }}</button>
          <button class="btn btn-danger" @click="rejectId = a.id">{{ t('admin.reject') }}</button>
        </div>
      </div>

      <div v-if="rejectId" class="card mt-4">
        <label>{{ t('admin.reason') }}
          <input v-model="rejectReason" class="input" />
        </label>
        <button class="btn btn-danger mt-4" @click="confirmReject">{{ t('admin.reject') }}</button>
      </div>
    </section>

    <section class="card">
      <h2>{{ t('admin.users') }}</h2>
      <div v-if="!users.length" class="text-muted text-sm">{{ t('admin.no_users') }}</div>
      <div v-for="u in users" :key="u.email" class="border-b border-border py-3 flex gap-4 justify-between items-center flex-wrap">
        <div>
          <strong>{{ u.displayName }}</strong>
          <div class="text-muted text-sm">{{ u.email }}<span v-if="u.isProfessional" class="badge warn ml-2">{{ t('admin.is_pro') }}</span></div>
        </div>
        <button
          class="btn btn-danger"
          :disabled="deleting !== null || u.email === 'admin@justicia.bo'"
          @click="deleteTarget = u.email"
        >{{ t('admin.delete_user') }}</button>
      </div>

      <ModalConfirm
        :open="deleteTarget !== null"
        :title="t('admin.delete_user')"
        :message="t('admin.delete_confirm', { email: deleteTarget ?? '' })"
        @confirm="confirmDelete"
        @close="deleteTarget = null"
      />
    </section>

    <section class="card">
      <h2>{{ t('admin.faq') }}</h2>
      <p>Total de ítems: <strong>{{ faqStats.total }}</strong></p>
      <div class="flex gap-3 items-center flex-wrap">
        <span v-for="(count, mode) in faqStats.porModo" :key="mode" class="pill">
          {{ mode }}: {{ count }}
        </span>
      </div>
      <p class="text-muted text-sm">La edición de FAQ se administra en la base de datos (`faq_categories` / `faq_items`).</p>
    </section>
  </div>
</template>
