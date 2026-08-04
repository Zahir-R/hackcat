// Edge Function: aprobación de profesional (SDD §5.3) — solo admins.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const isAdmin = (user.app_metadata?.role) === 'admin'
  if (!isAdmin) return Response.json({ error: 'forbidden' }, { status: 403 })

  const { applicationId, approve, reason } = await req.json()

  const status = approve ? 'APPROVED' : 'REJECTED'
  const { data, error } = await supabase
    .from('professional_profiles')
    .update({ status, rejection_reason: approve ? null : reason, admin_reviewed_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select('profile_id')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
})
