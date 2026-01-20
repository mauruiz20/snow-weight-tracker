'use client'

import {
  createWeightRecord as apiCreateWeightRecord,
  deleteWeightRecordById,
  fetchWeightRecordById,
  fetchWeightRecords,
  updateWeightRecordById,
} from '@/lib/api'
import { logWeightRecordDelete, logWeightRecordUpdate } from '@/lib/supabase/audit'
import type { WeightRecord, WeightRecordInsert, WeightRecordUpdate } from '@/types/database.types'
import { useCallback, useEffect, useState } from 'react'
import { useRealtimeSubscription } from './useRealtimeSubscription'

interface UseWeightRecordsOptions {
  participantId?: string
}

interface UseWeightRecordsReturn {
  records: WeightRecord[]
  loading: boolean
  error: string | null
  createRecord: (data: WeightRecordInsert) => Promise<WeightRecord | null>
  updateRecord: (id: string, data: WeightRecordUpdate) => Promise<WeightRecord | null>
  deleteRecord: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useWeightRecords(options: UseWeightRecordsOptions = {}): UseWeightRecordsReturn {
  const { participantId } = options
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch weight records using API layer
  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchWeightRecords(participantId)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros de peso')
    } finally {
      setLoading(false)
    }
  }, [participantId])

  // Initial fetch
  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Realtime subscription for weight records
  useRealtimeSubscription<WeightRecord>({
    table: 'weight_records',
    filter: participantId ? `participant_id=eq.${participantId}` : undefined,
    onInsert: (newRecord) => {
      if (!participantId || newRecord.participant_id === participantId) {
        setRecords((prev) => {
          const newRecords = [...prev, newRecord]
          return newRecords.sort(
            (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          )
        })
      }
    },
    onUpdate: (updatedRecord) => {
      if (!participantId || updatedRecord.participant_id === participantId) {
        setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)))
      }
    },
    onDelete: (deletedRecord) => {
      setRecords((prev) => prev.filter((r) => r.id !== deletedRecord.id))
    },
  })

  // Create a new weight record
  const createRecord = useCallback(async (data: WeightRecordInsert): Promise<WeightRecord | null> => {
    try {
      return await apiCreateWeightRecord(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear registro de peso')
      return null
    }
  }, [])

  // Update a weight record (with audit logging)
  const updateRecord = useCallback(
    async (id: string, data: WeightRecordUpdate): Promise<WeightRecord | null> => {
      try {
        // Get current data for audit
        const oldData = await fetchWeightRecordById(id)
        if (!oldData) throw new Error('Registro no encontrado')

        // Perform update
        const updatedRecord = await updateWeightRecordById(id, data)

        // Log audit (fire and forget)
        logWeightRecordUpdate(
          id,
          oldData as unknown as Record<string, unknown>,
          updatedRecord as unknown as Record<string, unknown>
        )

        return updatedRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar registro de peso')
        return null
      }
    },
    []
  )

  // Delete a weight record (with audit logging)
  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Get current data for audit
      const oldData = await fetchWeightRecordById(id)
      if (!oldData) throw new Error('Registro no encontrado')

      // Perform delete
      await deleteWeightRecordById(id)

      // Log audit (fire and forget)
      logWeightRecordDelete(id, oldData as unknown as Record<string, unknown>)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar registro de peso')
      return false
    }
  }, [])

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: loadRecords,
  }
}
