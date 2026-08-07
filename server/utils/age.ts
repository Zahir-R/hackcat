export function ageInYears(birthDate: string): number {
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

export function deriveAgeMode(birthDate: string): 'CHILD' | 'ADULT' | 'ELDER' {
  const age = ageInYears(birthDate)
  if (age <= 12) return 'CHILD'
  if (age <= 64) return 'ADULT'
  return 'ELDER'
}
