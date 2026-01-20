'use client'

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef } from 'react'

type PostgresChanges = RealtimePostgresChangesPayload<Record<string, unknown>>

interface UseRealtimeSubscriptionOptions<T> {
  table: string
  schema?: string
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T, oldRecord: T) => void
  onDelete?: (oldRecord: T) => void
}

export function useRealtimeSubscription<T extends Record<string, unknown>>({
  table,
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeSubscriptionOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())

  const handleChanges = useCallback(
    (payload: PostgresChanges) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      switch (eventType) {
        case 'INSERT':
          if (onInsert && newRecord) {
            onInsert(newRecord as T)
          }
          break
        case 'UPDATE':
          if (onUpdate && newRecord) {
            onUpdate(newRecord as T, oldRecord as T)
          }
          break
        case 'DELETE':
          if (onDelete && oldRecord) {
            onDelete(oldRecord as T)
          }
          break
      }
    },
    [onInsert, onUpdate, onDelete]
  )

  useEffect(() => {
    const supabase = supabaseRef.current
    const channelName = `${table}-changes${filter ? `-${filter}` : ''}`

    // Build the subscription config
    const subscriptionConfig: {
      event: '*'
      schema: string
      table: string
      filter?: string
    } = {
      event: '*',
      schema,
      table,
    }

    if (filter) {
      subscriptionConfig.filter = filter
    }

    // Create the channel and subscribe
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', subscriptionConfig, handleChanges)
      .subscribe()

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, schema, filter, handleChanges])

  return channelRef.current
}
