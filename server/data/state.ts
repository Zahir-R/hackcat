import type { AvailabilitySlot, Booking, ProfessionalApplication, Specialist, StoredUser } from '../../app/types'
import { specialists as seedSpecialists } from './mock'
import { deriveAgeMode } from '../utils/age'

export const ADMIN_EMAIL = 'admin@justicia.bo'
export const DEMO_PASSWORD = 'demo123'

export const state: {
  users: StoredUser[]
  applications: ProfessionalApplication[]
  specialists: Specialist[]
  slots: AvailabilitySlot[]
  bookings: Booking[]
} = {
  users: [],
  applications: [],
  specialists: [],
  slots: [],
  bookings: [],
}

export function upsertSpecialistFromApplication(app: ProfessionalApplication) {
  const existing = state.specialists.find(s => s.profileId === app.profileId)
  const hash = [...app.profileId].reduce((a, c) => a + c.charCodeAt(0), 0)
  const jitter = (hash % 40) / 4000
  const hasDrawn = Number.isFinite(app.lat) && Number.isFinite(app.lng)
  const base: Specialist = {
    id: existing?.id ?? `sp-${crypto.randomUUID().slice(0, 8)}`,
    profileId: app.profileId,
    name: app.name,
    headline: app.headline,
    bio: app.bio,
    experienceYears: app.experienceYears,
    city: app.city,
    lat: hasDrawn ? app.lat! : -19.0333 + jitter,
    lng: hasDrawn ? app.lng! : -65.2627 + jitter,
    status: 'APPROVED',
    roles: app.roles,
    specialties: app.specialties,
    languages: app.languages,
  }
  if (existing) Object.assign(existing, base)
  else state.specialists.push(base)
}

function seedSlots() {
  const now = Date.now()
  const day = 86400000
  state.specialists.filter(s => s.status === 'APPROVED').forEach((s, pi) => {
    for (let d = 1; d <= 4; d++) {
      for (const h of [9, 11, 15, 17]) {
        const start = new Date(now + d * day)
        start.setUTCHours(h, 0, 0, 0)
        const end = new Date(start.getTime() + 60 * 60000)
        state.slots.push({
          id: `sl-${s.id}-${d}-${h}`,
          professionalId: s.id,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          modality: (pi + d + h) % 3 === 0 ? 'VIDEO' : (pi + d) % 2 === 0 ? 'VOICE' : 'VISIT',
          isBooked: false,
        })
      }
    }
  })
}

export function seedState() {
  state.users.length = 0
  state.applications.length = 0
  state.specialists.length = 0
  state.slots.length = 0
  state.bookings.length = 0

  state.specialists.push(...seedSpecialists.map(s => ({ ...s })))

  state.users.push(
    {
      id: ADMIN_EMAIL, email: ADMIN_EMAIL, password: DEMO_PASSWORD,
      displayName: 'Administradora', birthDate: '1985-06-01', ageMode: 'ADULT',
      phone: '', language: 'es', isProfessional: false,
    },
    {
      id: 'demo.citizen@justicia.bo', email: 'demo.citizen@justicia.bo', password: DEMO_PASSWORD,
      displayName: 'Ciudadana Demo', birthDate: '1990-03-15', ageMode: 'ADULT',
      phone: '70012345', language: 'es', isProfessional: false,
    },
    {
      id: 'demo.profesional@justicia.bo', email: 'demo.profesional@justicia.bo', password: DEMO_PASSWORD,
      displayName: 'Lic. Luisa Mamani', birthDate: '1987-11-02', ageMode: 'ADULT',
      phone: '70054321', language: 'es', isProfessional: true,
    },
  )

  const demoApp: ProfessionalApplication = {
    id: 'app-demo-pro',
    profileId: 'demo.profesional@justicia.bo',
    name: 'Lic. Luisa Mamani',
    headline: 'Psicóloga — acompañamiento en duelo y violencia',
    bio: 'Psicóloga clínica con 6 años de experiencia. Sesiones a tarifa social en español y quechua.',
    experienceYears: 6,
    city: 'Sucre',
    lat: -19.0333,
    lng: -65.2627,
    roles: ['psicologo'],
    specialties: ['duelo', 'violencia'],
    languages: ['es', 'qu'],
    status: 'APPROVED',
  }
  state.applications.push(demoApp)
  state.specialists.push({
    id: 'sp-demo-pro',
    profileId: demoApp.profileId,
    name: demoApp.name,
    headline: demoApp.headline,
    bio: demoApp.bio,
    experienceYears: demoApp.experienceYears,
    city: demoApp.city,
    lat: -19.0333,
    lng: -65.2627,
    status: 'APPROVED',
    roles: demoApp.roles,
    specialties: demoApp.specialties,
    languages: demoApp.languages,
  })

  state.applications.push(
    {
      id: 'app-1', profileId: 'carlos@example.bo', name: 'Carlos Rojas',
      headline: 'Abogado laboralista', bio: '5 años de experiencia en defensa laboral y conciliación.',
      experienceYears: 5, city: 'Sucre', lat: -19.0350, lng: -65.2610, roles: ['abogado'], specialties: ['laboral'],
      languages: ['es'], status: 'PENDING',
    },
    {
      id: 'app-2', profileId: 'elena@example.bo', name: 'Elena Quisbert',
      headline: 'Trabajadora social — protección a la niñez',
      bio: 'Acompaña procesos con la Defensoría de la Niñez y el SLIM.',
      experienceYears: 8, city: 'Sucre', lat: -19.0310, lng: -65.2660, roles: ['trabajador_social'], specialties: ['proteccion'],
      languages: ['es', 'qu'], status: 'PENDING',
    },
  )

  seedSlots()
}

export function resetState() {
  seedState()
}

export function removeUserData(email: string): boolean {
  const user = state.users.find(u => u.email === email)
  if (!user) return false

  state.applications = state.applications.filter(a => a.profileId !== user.id)

  const prof = state.specialists.find(s => s.profileId === user.id)
  if (prof) {
    state.slots = state.slots.filter(s => s.professionalId !== prof.id)
    state.bookings = state.bookings.filter(b => b.professionalId !== prof.id)
    state.specialists = state.specialists.filter(s => s.profileId !== user.id)
  }

  const clientBookings = state.bookings.filter(b => b.clientId === user.id)
  for (const b of clientBookings) {
    const slot = state.slots.find(s => s.id === b.slotId)
    if (slot) slot.isBooked = false
  }
  state.bookings = state.bookings.filter(b => b.clientId !== user.id)

  state.users = state.users.filter(u => u.email !== email)
  return true
}

seedState()
