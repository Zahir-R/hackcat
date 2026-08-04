import type { Profile } from '~/types'

interface StoredUser extends Profile {
  email: string
  password: string
}

interface ProfessionalApplication {
  id: string
  profileId: string
  name: string
  headline: string
  bio: string
  experienceYears: number
  city: string
  roles: string[]
  specialties: string[]
  languages: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

const USERS_KEY = 'jc_users'
const SESSION_KEY = 'jc_session'
const APPS_KEY = 'jc_applications'
const ADMIN_EMAIL = 'admin@justicia.bo'

function loadUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function saveUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function loadApps(): ProfessionalApplication[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(APPS_KEY) || '[]') } catch { return [] }
}
function saveApps(apps: ProfessionalApplication[]) {
  window.localStorage.setItem(APPS_KEY, JSON.stringify(apps))
}

const toProfile = (u: StoredUser): Profile => ({
  id: u.id,
  email: u.email,
  displayName: u.displayName,
  birthDate: u.birthDate,
  ageMode: u.ageMode,
  phone: u.phone,
  language: u.language,
  isProfessional: u.isProfessional,
})

export const useAuth = () => {
  const user = useState<Profile | null>('jc:user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.id === ADMIN_EMAIL)
  const isProfessional = computed(() => !!user.value?.isProfessional)

  function restore() {
    if (typeof window === 'undefined') return
    const email = window.localStorage.getItem(SESSION_KEY)
    if (!email) return
    const u = loadUsers().find(x => x.email === email)
    if (u) user.value = toProfile(u)
  }

  function register(data: { email: string; password: string; displayName: string; birthDate: string; phone?: string; isProfessional: boolean }) {
    const users = loadUsers()
    if (users.some(u => u.email === data.email)) throw new Error('email_exists')
    const { ageMode } = useAgeMode()
    const stored: StoredUser = {
      id: data.email,
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      birthDate: data.birthDate,
      ageMode: deriveAgeMode(data.birthDate),
      phone: data.phone ?? '',
      language: 'es',
      isProfessional: data.isProfessional,
    }
    users.push(stored)
    saveUsers(users)
    window.localStorage.setItem(SESSION_KEY, stored.email)
    user.value = toProfile(stored)
    void ageMode
  }

  function login(email: string, password: string) {
    const u = loadUsers().find(x => x.email === email)
    if (!u || u.password !== password) throw new Error('invalid_credentials')
    window.localStorage.setItem(SESSION_KEY, u.email)
    user.value = toProfile(u)
  }

  function logout() {
    window.localStorage.removeItem(SESSION_KEY)
    user.value = null
  }

  function update(partial: Partial<Profile>) {
    if (!user.value) return
    const users = loadUsers()
    const i = users.findIndex(u => u.id === user.value!.id)
    if (i < 0) return
    users[i] = { ...users[i], ...partial, birthDate: partial.birthDate ?? users[i].birthDate, ageMode: partial.birthDate ? deriveAgeMode(partial.birthDate) : users[i].ageMode }
    saveUsers(users)
    user.value = toProfile(users[i])
  }

  const applications = useState<ProfessionalApplication[]>('jc:apps', () => loadApps())

  function applyProfessional(app: Omit<ProfessionalApplication, 'id' | 'profileId' | 'status'>) {
    if (!user.value) throw new Error('not_logged_in')
    const newApp: ProfessionalApplication = {
      id: crypto.randomUUID(),
      profileId: user.value.id,
      ...app,
      status: 'PENDING',
    }
    applications.value = [newApp, ...applications.value.filter(a => a.profileId !== user.value!.id)]
    saveApps(applications.value)
    update({ isProfessional: true })
  }

  function approve(id: string) {
    applications.value = applications.value.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a)
    saveApps(applications.value)
  }

  function reject(id: string, reason: string) {
    applications.value = applications.value.map(a => a.id === id ? { ...a, status: 'REJECTED', rejectionReason: reason } : a)
    saveApps(applications.value)
  }

  const myApplication = computed(() =>
    user.value ? applications.value.find(a => a.profileId === user.value!.id) ?? null : null,
  )

  return { user, isLoggedIn, isAdmin, isProfessional, restore, register, login, logout, update, applications, applyProfessional, approve, reject, myApplication }
}
