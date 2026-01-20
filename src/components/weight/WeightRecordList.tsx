'use client'

import type { WeightRecord } from '@/types/database.types'
import { WeightRecordCard } from './WeightRecordCard'
import { WeightRecordForm } from './WeightRecordForm'

interface WeightRecordFormData {
  weight: number
  recorded_at: string
  notes: string | null
}

interface WeightRecordListProps {
  records: WeightRecord[]
  loading?: boolean
  editingId?: string | null
  onEdit?: (id: string) => void
  onUpdate?: (id: string, data: WeightRecordFormData) => Promise<void>
  onDelete?: (id: string) => void
  onCancelEdit?: () => void
}

export function WeightRecordList({
  records,
  loading = false,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
}: WeightRecordListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aún no hay registros de peso.</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Agrega tu primera medición de peso arriba.
        </p>
      </div>
    )
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )

  return (
    <div className="space-y-3">
      {sortedRecords.map((record, index) => {
        const previousRecord = sortedRecords[index + 1]
        const previousWeight = previousRecord?.weight

        if (editingId === record.id && onUpdate && onCancelEdit) {
          return (
            <div
              key={record.id}
              className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
            >
              <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Editar Registro
              </h4>
              <WeightRecordForm
                record={record}
                onSubmit={(data) => onUpdate(record.id, data)}
                onCancel={onCancelEdit}
              />
            </div>
          )
        }

        return (
          <WeightRecordCard
            key={record.id}
            record={record}
            previousWeight={previousWeight}
            onEdit={onEdit ? () => onEdit(record.id) : undefined}
            onDelete={onDelete ? () => onDelete(record.id) : undefined}
          />
        )
      })}
    </div>
  )
}
