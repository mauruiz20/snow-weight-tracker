interface AuditPayload {
  table_name: string
  record_id: string
  action: 'UPDATE' | 'DELETE'
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
}

/**
 * Logs an audit entry for UPDATE or DELETE operations.
 * Calls the Edge Function which captures IP address and user agent.
 */
export async function logAudit(
  payload: AuditPayload
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    return { success: false, error: 'Supabase URL not configured' }
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/audit-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Audit log failed:', errorData)
      return { success: false, error: errorData.error || 'Failed to log audit' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error calling audit function:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Helper to log participant updates
 */
export async function logParticipantUpdate(
  recordId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
) {
  return logAudit({
    table_name: 'participants',
    record_id: recordId,
    action: 'UPDATE',
    old_data: oldData,
    new_data: newData,
  })
}

/**
 * Helper to log weight record updates
 */
export async function logWeightRecordUpdate(
  recordId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
) {
  return logAudit({
    table_name: 'weight_records',
    record_id: recordId,
    action: 'UPDATE',
    old_data: oldData,
    new_data: newData,
  })
}

/**
 * Helper to log weight record deletions
 */
export async function logWeightRecordDelete(recordId: string, oldData: Record<string, unknown>) {
  return logAudit({
    table_name: 'weight_records',
    record_id: recordId,
    action: 'DELETE',
    old_data: oldData,
  })
}
