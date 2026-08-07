export type AgeMode = 'CHILD' | 'ADULT' | 'ELDER'
export type LangCode = 'es' | 'qu' | 'gn' | 'en'

export interface Profile {
  id: string
  email?: string
  displayName: string
  birthDate: string
  ageMode: AgeMode
  phone: string
  language: LangCode
  isProfessional: boolean
}

export interface GuardianLink {
  id: string
  guardianId: string
  childId: string
  relationship: string
  consentStatus: 'PENDING' | 'APPROVED' | 'DENIED'
}

export interface Specialist {
  id: string
  profileId: string
  name: string
  headline: string
  bio: string
  experienceYears: number
  city: string
  lat: number
  lng: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  roles: string[]
  specialties: string[]
  languages: string[]
  distanceKm?: number
}

export interface AvailabilitySlot {
  id: string
  professionalId: string
  startsAt: string
  endsAt: string
  modality: 'VISIT' | 'VOICE' | 'VIDEO'
  isBooked: boolean
}

export interface Booking {
  id: string
  clientId: string
  professionalId: string
  professionalName: string
  clientName?: string
  slotId: string
  startsAt: string
  modality: 'VISIT' | 'VOICE' | 'VIDEO'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes: string
}

export interface StoredUser {
  id: string
  email: string
  password: string
  displayName: string
  birthDate: string
  ageMode: AgeMode
  phone: string
  language: LangCode
  isProfessional: boolean
}

export interface ProfessionalApplication {
  id: string
  profileId: string
  name: string
  headline: string
  bio: string
  experienceYears: number
  city: string
  lat?: number
  lng?: number
  roles: string[]
  specialties: string[]
  languages: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export type FaqTargetType = 'PAGE' | 'SPECIALISTS_FILTER' | 'FORUM_TOPIC' | 'PROFILE'

export interface FaqItem {
  id: string
  categoryId: string
  categoryLabel: string
  question: string
  answer: string
  keywords: string[]
  targetType: FaqTargetType
  targetId: string
  ageMode: AgeMode | 'ALL'
}

export interface FaqCategory {
  id: string
  slug: string
  label: string
  items: FaqItem[]
}

export interface ForumTopic {
  id: string
  title: string
  body: string
  authorName: string
  createdAt: string
  status: 'OPEN' | 'LOCKED' | 'HIDDEN'
  replies: ForumReply[]
}

export interface ForumReply {
  id: string
  authorName: string
  body: string
  createdAt: string
  hidden: boolean
}
