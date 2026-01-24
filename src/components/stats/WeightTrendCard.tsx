'use client'

import type { TrendResult } from '@/utils/weight-trend'
import { formatTargetDate, formatTrendLabel } from '@/utils/weight-trend'

interface WeightTrendCardProps {
  result: TrendResult
}

export function WeightTrendCard({ result }: WeightTrendCardProps) {
  const { method, trendKgPerWeek, predictedWeight, targetDate, isInitialEstimate } = result

  if (method === 'insufficient') {
    return (
      <div className='rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-800/50 dark:bg-amber-900/20'>
        <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
          Necesitás más registros
        </p>
        <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
          Agregá al menos dos registros de peso para ver tu tendencia y proyección.
        </p>
      </div>
    )
  }

  const trendLabel = formatTrendLabel(trendKgPerWeek)
  const targetDateStr = formatTargetDate(targetDate)

  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
      <div className='space-y-2'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>Tendencia real</p>
        <p className='text-lg font-semibold text-gray-900 dark:text-white'>{trendLabel}</p>
        {predictedWeight !== null && (
          <p className='text-sm text-gray-700 dark:text-gray-300'>
            Si mantenés este ritmo, el {targetDateStr} estarías en ~{predictedWeight} kg
          </p>
        )}
        {isInitialEstimate && (
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Estimación inicial — con más registros la tendencia será más precisa.
          </p>
        )}
      </div>
    </div>
  )
}
