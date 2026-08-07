import type { Profile, StoredUser } from '../../app/types'

export function toProfile(u: StoredUser): Profile {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    birthDate: u.birthDate,
    ageMode: u.ageMode,
    phone: u.phone,
    language: u.language,
    isProfessional: u.isProfessional,
  }
}
