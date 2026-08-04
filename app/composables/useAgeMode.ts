import type { AgeMode, LangCode, Profile } from '~/types'

const AGE_BOUNDARIES = { CHILD_MAX: 12, ADULT_MAX: 64 }

export function ageInYears(birthDate: string): number {
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

export function deriveAgeMode(birthDate: string): AgeMode {
  const age = ageInYears(birthDate)
  if (age <= AGE_BOUNDARIES.CHILD_MAX) return 'CHILD'
  if (age <= AGE_BOUNDARIES.ADULT_MAX) return 'ADULT'
  return 'ELDER'
}

const STORAGE_KEY = 'jc_profile'

export const useAgeMode = () => {
  const profile = useState<Profile | null>('jc:profile', () => null)
  const birthDate = computed<string>(() => profile.value?.birthDate ?? '1995-01-01')
  const ageMode = computed<AgeMode>(() => profile.value?.ageMode ?? deriveAgeMode(birthDate.value))

  function setBirthDate(value: string) {
    const mode = deriveAgeMode(value)
    profile.value = { ...(profile.value ?? emptyProfile()), birthDate: value, ageMode: mode }
  }

  return { profile, birthDate, ageMode, setBirthDate }
}

function emptyProfile(): Profile {
  return {
    id: '',
    displayName: '',
    birthDate: '1995-01-01',
    ageMode: 'ADULT',
    phone: '',
    language: 'es',
    isProfessional: false,
  }
}

export function langCode(): LangCode {
  if (typeof window !== 'undefined') {
    const s = window.localStorage.getItem('jc_locale')
    if (s === 'es' || s === 'qu' || s === 'gn' || s === 'en') return s
  }
  return 'es'
}
