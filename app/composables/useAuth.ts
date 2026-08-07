import type { Profile, ProfessionalApplication } from '~/types'

export const ADMIN_EMAIL = 'admin@justicia.bo'
const SESSION_KEY = 'jc_session'

let restorePromise: Promise<void> | null = null

const toErrorMessage = (e: unknown) => {
  if (e && typeof e === 'object' && 'status' in e) {
    const status = (e as { status: number }).status
    if (status === 409) return 'email_exists'
    if (status === 401) return 'invalid_credentials'
  }
  return null
}

export const useAuth = () => {
  const user = useState<Profile | null>('jc:user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.id === ADMIN_EMAIL)
  const isProfessional = computed(() => !!user.value?.isProfessional)
  const applications = useState<ProfessionalApplication[]>('jc:apps', () => [])
  const users = useState<{ id: string; email: string; displayName: string; isProfessional: boolean }[]>('jc:users', () => [])
  const loading = useState('jc:auth-loading', () => false)

  function setSession(me: Profile) {
    user.value = me
    window.localStorage.setItem(SESSION_KEY, me.email ?? me.id)
    useAgeMode().setBirthDate(me.birthDate)
  }

  function clearSession() {
    window.localStorage.removeItem(SESSION_KEY)
    user.value = null
    applications.value = []
  }

  async function refreshApplications() {
    if (!user.value) {
      applications.value = []
      return
    }
    applications.value = await $fetch<ProfessionalApplication[]>('/api/applications', {
      query: { email: user.value.email },
    })
  }

  async function restore() {
    if (typeof window === 'undefined') return
    if (!restorePromise) {
      restorePromise = doRestore().finally(() => { restorePromise = null })
    }
    return restorePromise
  }

  async function doRestore() {
    const email = window.localStorage.getItem(SESSION_KEY)
    if (!email) return
    try {
      const me = await $fetch<Profile>('/api/auth/me', { query: { email } })
      setSession(me)
      await refreshApplications()
    } catch {
      clearSession()
    }
  }

  async function register(data: { email: string; password: string; displayName: string; birthDate: string; phone?: string; isProfessional: boolean }) {
    try {
      const me = await $fetch<Profile>('/api/auth/register', {
        method: 'POST',
        body: { ...data, email: data.email.trim().toLowerCase() },
      })
      setSession(me)
      await refreshApplications()
      return me
    } catch (e) {
      const msg = toErrorMessage(e)
      if (msg) throw new Error(msg)
      throw e
    }
  }

  async function login(email: string, password: string) {
    try {
      const me = await $fetch<Profile>('/api/auth/login', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), password },
      })
      setSession(me)
      await refreshApplications()
      return me
    } catch (e) {
      const msg = toErrorMessage(e)
      if (msg) throw new Error(msg)
      throw e
    }
  }

  function logout() {
    clearSession()
  }

  async function update(partial: Partial<Profile>) {
    if (!user.value) return
    const me = await $fetch<Profile>('/api/profiles', {
      method: 'PATCH',
      body: { email: user.value.email, ...partial },
    })
    setSession(me)
  }

  async function applyProfessional(app: Omit<ProfessionalApplication, 'id' | 'profileId' | 'name' | 'status'>) {
    if (!user.value) throw new Error('not_logged_in')
    await $fetch<ProfessionalApplication>('/api/applications', {
      method: 'POST',
      body: { email: user.value.email, ...app },
    })
    await refreshApplications()
    await restore()
  }

  async function approve(id: string) {
    if (!user.value) return
    await $fetch<ProfessionalApplication>(`/api/applications/${id}`, {
      method: 'PATCH',
      body: { email: user.value.email, action: 'approve' },
    })
    await refreshApplications()
  }

  async function reject(id: string, reason: string) {
    if (!user.value) return
    await $fetch<ProfessionalApplication>(`/api/applications/${id}`, {
      method: 'PATCH',
      body: { email: user.value.email, action: 'reject', reason },
    })
    await refreshApplications()
  }

  async function fetchUsers() {
    if (!user.value) return
    users.value = await $fetch('/api/users', { query: { email: user.value.email } })
  }

  async function deleteUser(email: string) {
    if (!user.value) return
    await $fetch(`/api/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      query: { email: user.value.email },
    })
    users.value = users.value.filter(u => u.email !== email)
  }

  const myApplication = computed(() =>
    user.value ? applications.value.find(a => a.profileId === user.value!.id) ?? null : null,
  )

  return { user, isLoggedIn, isAdmin, isProfessional, loading, restore, register, login, logout, update, applications, refreshApplications, applyProfessional, approve, reject, myApplication, users, fetchUsers, deleteUser }
}
