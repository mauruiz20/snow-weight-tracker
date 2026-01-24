'use client'

import type { Participant } from '@/types/database.types'
import type { WeightStats } from '@/utils/weight-calculations'
import { WeightDiffBadge } from './WeightDiffBadge'

interface WeightStatsCardProps {
  participant: Participant
  stats: WeightStats
}

export function WeightStatsCard({ participant, stats }: WeightStatsCardProps) {
  const {
    currentWeight,
    weightDiff,
    weightLossPercentage,
    minWeight,
    maxWeight,
    totalRecords,
    currentBMI,
    bmiCategory,
    bodyFatPercentage,
    bodyFatCategory
  } = stats

  return (
    <div className='space-y-6'>
      {/* Main Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Peso Actual
          </p>
          <p className='mt-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {currentWeight.toFixed(2)} kg
          </p>
        </div>

        <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Peso Inicial
          </p>
          <p className='mt-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {participant.initial_weight.toFixed(2)} kg
          </p>
        </div>

        <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Progreso</p>
          <div className='mt-1'>
            <WeightDiffBadge
              diff={weightDiff}
              showPercentage
              percentage={weightLossPercentage}
              size='lg'
            />
          </div>
        </div>

        <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Registros</p>
          <p className='mt-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {totalRecords}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Altura</p>
          <p className='mt-1 text-lg font-semibold text-gray-900 dark:text-white'>
            {participant.height.toFixed(0)} cm
          </p>
        </div>

        <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>IMC Actual</p>
          <p className='mt-1 text-lg font-semibold text-gray-900 dark:text-white'>
            {currentBMI?.toFixed(2) || '-'}
            {bmiCategory && (
              <span className='ml-2 text-sm font-normal text-gray-500 dark:text-gray-400'>
                ({bmiCategory})
              </span>
            )}
          </p>
        </div>

        <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Grasa Corporal
          </p>
          <p className='mt-1 text-lg font-semibold text-gray-900 dark:text-white'>
            {bodyFatPercentage ? `${bodyFatPercentage}%` : '-'}
            {bodyFatCategory && (
              <span className='ml-2 text-sm font-normal text-gray-500 dark:text-gray-400'>
                ({bodyFatCategory})
              </span>
            )}
          </p>
        </div>

        <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Rango de Peso
          </p>
          <p className='mt-1 text-lg font-semibold text-gray-900 dark:text-white'>
            {minWeight && maxWeight
              ? `${minWeight.toFixed(2)} - ${maxWeight.toFixed(2)} kg`
              : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}
