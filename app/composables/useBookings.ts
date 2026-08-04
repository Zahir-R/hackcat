import type { Booking, AvailabilitySlot } from '~/types'

export const useBookings = () => {
  const slots = useState<AvailabilitySlot[]>('jc:slots', () => [])
  const myBookings = useState<Booking[]>('jc:mybookings', () => [])
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

  async function createBooking(professionalId: string, slot: AvailabilitySlot, notes: string, clientName: string) {
    const booking = await $fetch<Booking>('/api/bookings', {
      method: 'POST',
      body: {
        slotId: slot.id,
        modality: slot.modality,
        startsAt: slot.startsAt,
        notes,
        clientName,
      },
    })
    slots.value = slots.value.filter(s => s.id !== slot.id)
    myBookings.value = [booking, ...myBookings.value]
    message.value = 'Reserva solicitada. Recibirás una confirmación.'
  }

  function clearMessage() { message.value = null }

  return { slots, myBookings, loading, message, fetchSlots, createBooking, clearMessage }
}
