import { createClient } from '@/lib/supabase/client'
import type { WeightRecord, WeightRecordInsert, WeightRecordUpdate } from '@/types/database.types'

const supabase = createClient()

/**
 * Fetch weight records, optionally filtered by participant
 */
export async function fetchWeightRecords(participantId?: string): Promise<WeightRecord[]> {
  let query = supabase
    .from('weight_records')
    .select('*')
    .order('recorded_at', { ascending: false })

  if (participantId) {
    query = query.eq('participant_id', participantId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data as WeightRecord[]) || []
}

/**
 * Fetch a single weight record by ID
 */
export async function fetchWeightRecordById(id: string): Promise<WeightRecord | null> {
  const { data, error } = await supabase
    .from('weight_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data as WeightRecord
}

/**
 * Create a new weight record
 */
export async function createWeightRecord(data: WeightRecordInsert): Promise<WeightRecord> {
  const { data: newRecord, error } = await supabase
    .from('weight_records')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return newRecord as WeightRecord
}

/**
 * Update a weight record by ID
 */
export async function updateWeightRecordById(
  id: string,
  data: WeightRecordUpdate
): Promise<WeightRecord> {
  const { data: updatedRecord, error } = await supabase
    .from('weight_records')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return updatedRecord as WeightRecord
}

/**
 * Delete a weight record by ID
 */
export async function deleteWeightRecordById(id: string): Promise<void> {
  const { error } = await supabase.from('weight_records').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Fetch all weight records with participant names (for charts)
 */
export async function fetchWeightRecordsWithParticipants(): Promise<
  Array<{
    participant_id: string
    weight: number
    recorded_at: string
    participants: { name: string } | null
  }>
> {
  const { data, error } = await supabase
    .from('weight_records')
    .select(`
      participant_id,
      weight,
      recorded_at,
      participants (name)
    `)
    .order('recorded_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}
