'use client'

import { logWeightRecordDelete, logWeightRecordUpdate } from '@/lib/supabase/audit'
import { createClient } from '@/lib/supabase/client'
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

  const supabase = createClient()

  // Fetch weight records
  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('weight_records')
        .select('*')
        .order('recorded_at', { ascending: false })

      if (participantId) {
        query = query.eq('participant_id', participantId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setRecords((data as WeightRecord[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weight records')
    } finally {
      setLoading(false)
    }
  }, [supabase, participantId])

  // Initial fetch
  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Realtime subscription for weight records
  useRealtimeSubscription<WeightRecord>({
    table: 'weight_records',
    filter: participantId ? `participant_id=eq.${participantId}` : undefined,
    onInsert: (newRecord) => {
      if (!participantId || newRecord.participant_id === participantId) {
        setRecords((prev) => {
          // Insert in correct order (by recorded_at descending)
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
  const createRecord = useCallback(
    async (data: WeightRecordInsert): Promise<WeightRecord | null> => {
      try {
        const { data: newRecord, error: insertError } = await supabase
          .from('weight_records')
          .insert(data)
          .select()
          .single()

        if (insertError) throw insertError
        return newRecord as WeightRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create weight record')
        return null
      }
    },
    [supabase]
  )

  // Update a weight record (with audit logging)
  const updateRecord = useCallback(
    async (id: string, data: WeightRecordUpdate): Promise<WeightRecord | null> => {
      try {
        // First get the current data for audit
        const { data: oldData, error: fetchError } = await supabase
          .from('weight_records')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        // Perform the update
        const { data: updatedRecord, error: updateError } = await supabase
          .from('weight_records')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError

        // Log the audit (fire and forget)
        logWeightRecordUpdate(
          id,
          oldData as Record<string, unknown>,
          updatedRecord as Record<string, unknown>
        )

        return updatedRecord as WeightRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update weight record')
        return null
      }
    },
    [supabase]
  )

  // Delete a weight record (with audit logging)
  const deleteRecord = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // First get the current data for audit
        const { data: oldData, error: fetchError } = await supabase
          .from('weight_records')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        // Perform the delete
        const { error: deleteError } = await supabase.from('weight_records').delete().eq('id', id)

        if (deleteError) throw deleteError

        // Log the audit (fire and forget)
        logWeightRecordDelete(id, oldData as Record<string, unknown>)

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete weight record')
        return false
      }
    },
    [supabase]
  )

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  }
}
