'use client'

import { Button } from '@/components/ui'
import type { WeightRecord } from '@/types/database.types'
import { formatDateTime } from '@/utils/weight-calculations'
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'

interface WeightRecordCardProps {
  record: WeightRecord
  previousWeight?: number
  onEdit?: () => void
  onDelete?: () => void
}

export function WeightRecordCard({
  record,
  previousWeight,
  onEdit,
  onDelete,
}: WeightRecordCardProps) {
  const diff = previousWeight ? record.weight - previousWeight : null

  const getDiffColor = (d: number | null) => {
    if (d === null || d === 0) return 'text-gray-500 dark:text-gray-400'
    return d < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const formatDiff = (d: number | null) => {
    if (d === null) return '-'
    const sign = d > 0 ? '+' : ''
    return `${sign}${d.toFixed(2)} kg`
  }

  return (
    <div className="card-hover rounded-lg border border-gray-200/50 bg-white/80 p-4 backdrop-blur-sm transition-all dark:border-gray-700/50 dark:bg-gray-800/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {record.weight.toFixed(2)} kg
            </span>
            {diff !== null && (
              <span className={`text-sm font-medium ${getDiffColor(diff)}`}>{formatDiff(diff)}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDateTime(record.recorded_at)}
          </p>
          {record.notes && (
            <p className="mt-2 text-sm text-gray-600 break-words dark:text-gray-300">{record.notes}</p>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1 self-end sm:self-center sm:ml-4">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
                icon={<HiOutlinePencilSquare className="h-4 w-4" />}
                aria-label="Editar registro"
                className="border-0 shadow-none hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/30 dark:text-blue-400"
              >
                <span className="hidden sm:inline">Editar</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDelete}
                icon={<HiOutlineTrash className="h-4 w-4" />}
                aria-label="Eliminar registro"
                className="border-0 shadow-none hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400"
              >
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
