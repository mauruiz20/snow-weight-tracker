import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AuditPayload {
  table_name: string
  record_id: string
  action: 'UPDATE' | 'DELETE'
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get IP address from headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || req.headers.get('x-real-ip')
      || null

    // Get User-Agent
    const userAgent = req.headers.get('user-agent') || null

    // Parse request body
    const payload: AuditPayload = await req.json()

    // Validate payload
    if (!payload.table_name || !payload.record_id || !payload.action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: table_name, record_id, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['UPDATE', 'DELETE'].includes(payload.action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be UPDATE or DELETE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insert audit log
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        table_name: payload.table_name,
        record_id: payload.record_id,
        action: payload.action,
        old_data: payload.old_data || null,
        new_data: payload.new_data || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting audit log:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create audit log', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, audit_log_id: data.id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
