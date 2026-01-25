'use client'

import type { TrendResult } from '@/utils/weight-trend'
import { formatTargetDate, formatTrendLabel } from '@/utils/weight-trend'
import { TrendLabel } from '@/components/ui'

interface WeightTrendsSummaryProps {
  trends: Record<string, TrendResult>
}

export const WeightTrendsSummary = ({ trends }: WeightTrendsSummaryProps) => {
  const entries = Object.entries(trends)
  if (entries.length === 0) return null

  return (
    <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
      <h3 className='mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300'>
        Tendencias por participante
      </h3>
      <ul className='space-y-2'>
        {entries.map(([name, result]) => {
          if (result.method === 'insufficient') {
            return (
              <li
                key={name}
                className='text-sm text-amber-700 dark:text-amber-300'
              >
                <span className='font-medium'>{name}:</span> Necesitás más registros
              </li>
            )
          }
          const trend = formatTrendLabel(result.trendKgPerWeek)
          const targetStr = formatTargetDate(result.targetDate)
          const projection =
            result.predictedWeight != null
              ? `Si mantenés este ritmo, el ${targetStr} estarías en ~${result.predictedWeight} kg`
              : null
          return (
            <li key={name} className='flex flex-wrap items-center gap-1 text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-medium'>{name}:</span>
              <span>Tendencia real:</span>
              <TrendLabel trend={trend} />
              {projection && (
                <>
                  <span className='text-gray-600 dark:text-gray-400'>— {projection}</span>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
