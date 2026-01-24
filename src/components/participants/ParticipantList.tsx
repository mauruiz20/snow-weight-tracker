'use client'

import type { Participant, ParticipantRanking } from '@/types/database.types'
import { ParticipantCard } from './ParticipantCard'

interface ParticipantListProps {
  participants: Participant[]
  rankings?: ParticipantRanking[]
  loading?: boolean
}

export const ParticipantList = ({
  participants,
  rankings = [],
  loading = false,
}: ParticipantListProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-shimmer h-48 rounded-lg" />
        ))}
      </div>
    )
  }

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aún no hay participantes.</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          ¡Sé el primero en registrarte y comenzar a rastrear!
        </p>
      </div>
    )
  }

  const rankingMap = new Map(
    rankings.map((r) => [r.id, { currentWeight: r.current_weight, weightDiff: r.weight_diff }])
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {participants.map((participant, index) => {
        const ranking = rankingMap.get(participant.id)
        return (
          <div
            key={participant.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
          >
            <ParticipantCard
              participant={participant}
              currentWeight={ranking?.currentWeight}
              weightDiff={ranking?.weightDiff}
            />
          </div>
        )
      })}
    </div>
  )
}
