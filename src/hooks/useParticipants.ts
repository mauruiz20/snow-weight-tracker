'use client'

import {
  createParticipant as apiCreateParticipant,
  fetchParticipantById,
  fetchParticipantRankings,
  fetchParticipants,
  updateParticipantById,
} from '@/lib/api'
import { logParticipantUpdate } from '@/lib/supabase/audit'
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

  // Fetch all participants using API layer
  const loadParticipants = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchParticipants()
      setParticipants(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar participantes')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch rankings using API layer
  const loadRankings = useCallback(async () => {
    if (!includeRankings) return

    try {
      const data = await fetchParticipantRankings()
      setRankings(data)
    } catch (err) {
      console.error('Error al cargar rankings:', err)
    }
  }, [includeRankings])

  // Refetch both participants and rankings
  const refetch = useCallback(async () => {
    await Promise.all([loadParticipants(), loadRankings()])
  }, [loadParticipants, loadRankings])

  // Initial fetch
  useEffect(() => {
    refetch()
  }, [refetch])

  // Realtime subscription for participants
  useRealtimeSubscription<Participant>({
    table: 'participants',
    onInsert: (newParticipant) => {
      setParticipants((prev) => [newParticipant, ...prev])
      if (includeRankings) loadRankings()
    },
    onUpdate: (updatedParticipant) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === updatedParticipant.id ? updatedParticipant : p))
      )
      if (includeRankings) loadRankings()
    },
    onDelete: (deletedParticipant) => {
      setParticipants((prev) => prev.filter((p) => p.id !== deletedParticipant.id))
      if (includeRankings) loadRankings()
    },
  })

  // Create a new participant
  const createParticipant = useCallback(
    async (data: ParticipantInsert): Promise<Participant | null> => {
      try {
        return await apiCreateParticipant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear participante')
        return null
      }
    },
    []
  )

  // Update a participant (with audit logging)
  const updateParticipant = useCallback(
    async (id: string, data: ParticipantUpdate): Promise<Participant | null> => {
      try {
        // Get current data for audit
        const oldData = await fetchParticipantById(id)
        if (!oldData) throw new Error('Participante no encontrado')

        // Perform update
        const updatedParticipant = await updateParticipantById(id, data)

        // Log audit (fire and forget)
        logParticipantUpdate(
          id,
          oldData as unknown as Record<string, unknown>,
          updatedParticipant as unknown as Record<string, unknown>
        )

        return updatedParticipant
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar participante')
        return null
      }
    },
    []
  )

  // Get a single participant by ID
  const getParticipant = useCallback(async (id: string): Promise<Participant | null> => {
    try {
      return await fetchParticipantById(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar participante')
      return null
    }
  }, [])

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
