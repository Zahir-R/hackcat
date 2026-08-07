import type { Booking, AvailabilitySlot } from '~/types'

export const useBookings = () => {
  const slots = useState<AvailabilitySlot[]>('jc:slots', () => [])
  const myBookings = useState<Booking[]>('jc:mybookings', () => [])
  const mySlots = useState<AvailabilitySlot[]>('jc:my-slots', () => [])
  const professionalBookings = useState<Booking[]>('jc:pro-bookings', () => [])
  const loading = useState('jc:bookings-loading', () => false)
  const message = useState<string | null>('jc:bookings-msg', () => null)

  async function fetchSlots(professionalId: string) {
    loading.value = true
    try {
      slots.value = await $fetch<AvailabilitySlot[]>(`/api/availability/${professionalId}`)
    } finally {
      loading.value = false
    }
  }

  async function fetchMyBookings() {
    const { user } = useAuth()
    if (!user.value) return
    myBookings.value = await $fetch<Booking[]>('/api/bookings', { query: { email: user.value.email, role: 'client' } })
  }

  async function fetchProfessionalBookings() {
    const { user } = useAuth()
    if (!user.value) return
    professionalBookings.value = await $fetch<Booking[]>('/api/bookings', { query: { email: user.value.email, role: 'professional' } })
  }

  async function fetchMySlots() {
    const { user } = useAuth()
    if (!user.value) return
    mySlots.value = await $fetch<AvailabilitySlot[]>('/api/availability', { query: { email: user.value.email, mine: '1' } })
  }

  async function createBooking(professionalId: string, slot: AvailabilitySlot, notes: string) {
    const { user } = useAuth()
    if (!user.value) throw new Error('not_logged_in')
    const booking = await $fetch<Booking>('/api/bookings', {
      method: 'POST',
      body: { email: user.value.email, slotId: slot.id, notes },
    })
    slots.value = slots.value.filter(s => s.id !== slot.id)
    myBookings.value = [booking, ...myBookings.value]
    message.value = 'Reserva solicitada. Recibirás una confirmación.'
  }

  async function createSlot(startsAt: string, endsAt: string, modality: AvailabilitySlot['modality']) {
    const { user } = useAuth()
    if (!user.value) throw new Error('not_logged_in')
    const slot = await $fetch<AvailabilitySlot>('/api/availability', {
      method: 'POST',
      body: { email: user.value.email, startsAt, endsAt, modality },
    })
    mySlots.value = [...mySlots.value, slot].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    message.value = 'Franja publicada.'
  }

  async function deleteSlot(slotId: string) {
    const { user } = useAuth()
    if (!user.value) return
    await $fetch(`/api/availability/${slotId}`, { method: 'DELETE', body: { email: user.value.email } })
    mySlots.value = mySlots.value.filter(s => s.id !== slotId)
  }

  async function transition(bookingId: string, action: 'confirm' | 'reject' | 'complete' | 'cancel') {
    const { user } = useAuth()
    if (!user.value) throw new Error('not_logged_in')
    const updated = await $fetch<Booking>(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      body: { email: user.value.email, action },
    })
    myBookings.value = myBookings.value.map(b => b.id === updated.id ? updated : b)
    professionalBookings.value = professionalBookings.value.map(b => b.id === updated.id ? updated : b)
    return updated
  }

  const cancelBooking = (id: string) => transition(id, 'cancel')
  const confirmBooking = (id: string) => transition(id, 'confirm')
  const rejectBooking = (id: string) => transition(id, 'reject')
  const completeBooking = (id: string) => transition(id, 'complete')

  function clearMessage() { message.value = null }

  return {
    slots, myBookings, mySlots, professionalBookings, loading, message,
    fetchSlots, fetchMyBookings, fetchProfessionalBookings, fetchMySlots,
    createBooking, createSlot, deleteSlot,
    cancelBooking, confirmBooking, rejectBooking, completeBooking,
    clearMessage,
  }
}
