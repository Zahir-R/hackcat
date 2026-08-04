// Edge Function: reserva transaccional (SDD §5.5) — evita doble reserva.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { slotId, clientId, modality, notes } = await req.json()
  if (!slotId || !clientId || !modality) {
    return Response.json({ error: 'missing fields' }, { status: 400 })
  }

  // Bloqueo atómico de la franja.
  const { data: slot, error } = await supabase
    .from('availability_slots')
    .update({ is_booked: true })
    .eq('id', slotId)
    .eq('is_booked', false)
    .select('id, professional_id')
    .single()

  if (error || !slot) {
    return Response.json({ error: 'slot already taken' }, { status: 409 })
  }

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      client_id: clientId,
      professional_id: slot.professional_id,
      slot_id: slotId,
      modality,
      notes,
      status: 'PENDING',
    })
    .select()
    .single()

  if (insertError) {
    // Rollback de la franja.
    await supabase.from('availability_slots').update({ is_booked: false }).eq('id', slotId)
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  return Response.json(booking, { status: 201 })
})
