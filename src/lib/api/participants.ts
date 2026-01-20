import { createClient } from '@/lib/supabase/client'
import type {
  Participant,
  ParticipantInsert,
  ParticipantRanking,
  ParticipantUpdate,
} from '@/types/database.types'

const supabase = createClient()

/**
 * Fetch all participants ordered by creation date
 */
export async function fetchParticipants(): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as Participant[]) || []
}

/**
 * Fetch a single participant by ID
 */
export async function fetchParticipantById(id: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data as Participant
}

/**
 * Fetch participant rankings from the view
 */
export async function fetchParticipantRankings(): Promise<ParticipantRanking[]> {
  const { data, error } = await supabase.from('participant_rankings').select('*')

  if (error) throw new Error(error.message)
  return (data as ParticipantRanking[]) || []
}

/**
 * Create a new participant
 */
export async function createParticipant(data: ParticipantInsert): Promise<Participant> {
  const { data: newParticipant, error } = await supabase
    .from('participants')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return newParticipant as Participant
}

/**
 * Update a participant by ID
 */
export async function updateParticipantById(
  id: string,
  data: ParticipantUpdate
): Promise<Participant> {
  const { data: updatedParticipant, error } = await supabase
    .from('participants')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return updatedParticipant as Participant
}

/**
 * Fetch participants with their names (for charts and lists)
 */
export async function fetchParticipantsWithInitialWeight(): Promise<
  Array<{ id: string; name: string; initial_weight: number; created_at: string }>
> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, name, initial_weight, created_at')

  if (error) throw new Error(error.message)
  return data || []
}
