'use client'

import { ROUTES } from '@/lib/constants'
import type { Participant } from '@/types/database.types'
import { calculateBMI, formatDate, getBMICategory } from '@/utils/weight-calculations'
import Link from 'next/link'

interface ParticipantCardProps {
  participant: Participant
  currentWeight?: number
  weightDiff?: number
}

export const ParticipantCard = ({ participant, currentWeight, weightDiff }: ParticipantCardProps) => {
  const displayWeight = currentWeight ?? participant.initial_weight
  const bmi = calculateBMI(displayWeight, participant.height)
  const bmiCategory = bmi ? getBMICategory(bmi) : null

  const getWeightDiffColor = (diff: number | undefined) => {
    if (diff === undefined || diff === 0) return 'text-gray-500 dark:text-gray-400'
    return diff < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const formatWeightDiff = (diff: number | undefined) => {
    if (diff === undefined) return 'Sin registros'
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff.toFixed(2)} kg`
  }

  return (
    <Link href={ROUTES.participant(participant.id)}>
      <div className="card-hover rounded-lg border border-gray-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6 dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {participant.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edad: {participant.age}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayWeight.toFixed(1)} kg
            </p>
            <p className={`text-sm font-medium ${getWeightDiffColor(weightDiff)}`}>
              {formatWeightDiff(weightDiff)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 sm:gap-4 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Inicial</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {participant.initial_weight.toFixed(1)} kg
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Altura</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {participant.height.toFixed(0)} cm
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">IMC</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {bmi?.toFixed(1) || '-'}
              {bmiCategory && (
                <span className="text-xs text-gray-400 dark:text-gray-500"> ({bmiCategory})</span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Se unió el {formatDate(participant.created_at)}
        </div>
      </div>
    </Link>
  )
}
