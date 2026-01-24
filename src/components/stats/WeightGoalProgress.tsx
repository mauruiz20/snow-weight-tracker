'use client'

import type { Participant } from '@/types/database.types'

interface WeightGoalProgressProps {
  participant: Participant
  currentWeight: number
}

export const WeightGoalProgress = ({ participant, currentWeight }: WeightGoalProgressProps) => {
  const { initial_weight, target_weight } = participant

  if (target_weight === null || target_weight === undefined) {
    return null
  }

  const totalToLose = initial_weight - target_weight
  const alreadyLost = initial_weight - currentWeight

  // Calculate progress percentage (uncapped to show beyond 100%)
  const rawProgressPercentage = totalToLose !== 0
    ? (alreadyLost / totalToLose) * 100
    : 0

  // Clamp for the progress bar display (0-100%)
  const barPercentage = Math.min(100, Math.max(0, rawProgressPercentage))

  const remaining = currentWeight - target_weight
  const isGoalReached = currentWeight <= target_weight
  const extraLost = isGoalReached ? Math.abs(remaining) : 0
  const isGainingWeight = totalToLose > 0 && alreadyLost < 0

  // Determine bar color based on progress
  const getBarColor = () => {
    if (isGoalReached) return 'bg-green-500'
    if (isGainingWeight) return 'bg-red-500'
    if (barPercentage >= 75) return 'bg-green-500'
    if (barPercentage >= 50) return 'bg-blue-500'
    if (barPercentage >= 25) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-800/50 dark:bg-blue-900/20'>
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-sm font-medium text-blue-800 dark:text-blue-200'>
          Objetivo de Peso
        </p>
        {isGoalReached && (
          <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300'>
            ¡Meta alcanzada!
          </span>
        )}
      </div>

      <div className='space-y-3'>
        {/* Weight values */}
        <div className='flex items-center justify-between text-sm'>
          <span className='text-blue-700 dark:text-blue-300'>
            Actual: <span className='font-semibold'>{currentWeight.toFixed(1)} kg</span>
          </span>
          <span className='text-blue-700 dark:text-blue-300'>
            Meta: <span className='font-semibold'>{target_weight.toFixed(1)} kg</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className='h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${barPercentage}%` }}
          />
        </div>

        {/* Progress details */}
        <div className='flex items-center justify-between text-xs'>
          <span className='text-blue-600 dark:text-blue-400'>
            {rawProgressPercentage.toFixed(1)}% completado
          </span>
          {isGoalReached ? (
            extraLost > 0 && (
              <span className='text-green-600 dark:text-green-400'>
                +{extraLost.toFixed(1)} kg extra perdidos
              </span>
            )
          ) : (
            <span className='text-blue-600 dark:text-blue-400'>
              Faltan {remaining.toFixed(1)} kg
            </span>
          )}
        </div>

        {/* Additional context */}
        {isGainingWeight && !isGoalReached && (
          <p className='text-xs text-red-600 dark:text-red-400'>
            Has subido {Math.abs(alreadyLost).toFixed(1)} kg desde el inicio.
          </p>
        )}
      </div>
    </div>
  )
}
