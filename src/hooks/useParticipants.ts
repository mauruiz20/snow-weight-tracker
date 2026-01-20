'use client'

import { logParticipantUpdate } from '@/lib/supabase/audit'
import { createClient } from '@/lib/supabase/client'
import type {
  Participant,
  ParticipantInsert,
  ParticipantRanking,
  ParticipantUpdate,
} from '@/types/database.types'
import { useCallback, useEffect, useState } from 'react'
import { useRealtimeSubscription } from './useRealtimeSubscription'

interface UseParticipantsOptions {
  includeRankings?: boolean
}

interface UseParticipantsReturn {
  participants: Participant[]
  rankings: ParticipantRanking[]
  loading: boolean
  error: string | null
  createParticipant: (data: ParticipantInsert) => Promise<Participant | null>
  updateParticipant: (id: string, data: ParticipantUpdate) => Promise<Participant | null>
  getParticipant: (id: string) => Promise<Participant | null>
  refetch: () => Promise<void>
}

export function useParticipants(options: UseParticipantsOptions = {}): UseParticipantsReturn {
  const { includeRankings = false } = options
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rankings, setRankings] = useState<ParticipantRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch all participants
  const fetchParticipants = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setParticipants((data as Participant[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participants')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch rankings
  const fetchRankings = useCallback(async () => {
    if (!includeRankings) return

    try {
      const { data, error: fetchError } = await supabase.from('participant_rankings').select('*')

      if (fetchError) throw fetchError
      setRankings((data as ParticipantRanking[]) || [])
    } catch (err) {
      console.error('Failed to fetch rankings:', err)
    }
  }, [supabase, includeRankings])

  // Refetch both participants and rankings
  const refetch = useCallback(async () => {
    await Promise.all([fetchParticipants(), fetchRankings()])
  }, [fetchParticipants, fetchRankings])

  // Initial fetch
  useEffect(() => {
    refetch()
  }, [refetch])

  // Realtime subscription for participants
  useRealtimeSubscription<Participant>({
    table: 'participants',
    onInsert: (newParticipant) => {
      setParticipants((prev) => [newParticipant, ...prev])
      if (includeRankings) fetchRankings()
    },
    onUpdate: (updatedParticipant) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === updatedParticipant.id ? updatedParticipant : p))
      )
      if (includeRankings) fetchRankings()
    },
    onDelete: (deletedParticipant) => {
      setParticipants((prev) => prev.filter((p) => p.id !== deletedParticipant.id))
      if (includeRankings) fetchRankings()
    },
  })

  // Create a new participant
  const createParticipant = useCallback(
    async (data: ParticipantInsert): Promise<Participant | null> => {
      try {
        const { data: newParticipant, error: insertError } = await supabase
          .from('participants')
          .insert(data)
          .select()
          .single()

        if (insertError) throw insertError
        return newParticipant as Participant
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create participant')
        return null
      }
    },
    [supabase]
  )

  // Update a participant (with audit logging)
  const updateParticipant = useCallback(
    async (id: string, data: ParticipantUpdate): Promise<Participant | null> => {
      try {
        // First get the current data for audit
        const { data: oldData, error: fetchError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        // Perform the update
        const { data: updatedParticipant, error: updateError } = await supabase
          .from('participants')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError

        // Log the audit (fire and forget)
        logParticipantUpdate(
          id,
          oldData as Record<string, unknown>,
          updatedParticipant as Record<string, unknown>
        )

        return updatedParticipant as Participant
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update participant')
        return null
      }
    },
    [supabase]
  )

  // Get a single participant by ID
  const getParticipant = useCallback(
    async (id: string): Promise<Participant | null> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        return data as Participant
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch participant')
        return null
      }
    },
    [supabase]
  )

  return {
    participants,
    rankings,
    loading,
    error,
    createParticipant,
    updateParticipant,
    getParticipant,
    refetch,
  }
}
