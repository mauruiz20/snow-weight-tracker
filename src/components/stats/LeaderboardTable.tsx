'use client'

import { LinkButton } from '@/components/ui'
import type { ParticipantRanking } from '@/types/database.types'
import Link from 'next/link'
import { HiOutlineUserPlus } from 'react-icons/hi2'
import { WeightDiffBadge } from './WeightDiffBadge'

interface LeaderboardTableProps {
  rankings: ParticipantRanking[]
  loading?: boolean
}

export function LeaderboardTable({ rankings, loading = false }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 dark:bg-gray-700" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    )
  }

  if (rankings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aún no hay participantes.</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          ¡Sé el primero en registrarte y comenzar a rastrear!
        </p>
        <div className="mt-4">
          <LinkButton href="/participants/new" icon={<HiOutlineUserPlus className="h-5 w-5" />}>
            Registrarse Ahora
          </LinkButton>
        </div>
      </div>
    )
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
    if (rank === 2) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    if (rank === 3)
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400'
    return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th
              scope="col"
              className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 dark:text-gray-400"
            >
              #
            </th>
            <th
              scope="col"
              className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 dark:text-gray-400"
            >
              Participante
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell dark:text-gray-400"
            >
              Inicial
            </th>
            <th
              scope="col"
              className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 dark:text-gray-400"
            >
              Actual
            </th>
            <th
              scope="col"
              className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 dark:text-gray-400"
            >
              Progreso
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell dark:text-gray-400"
            >
              Registros
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {rankings.map((ranking, index) => {
            const rank = index + 1
            return (
              <tr key={ranking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${getRankBadge(rank)}`}
                  >
                    {rank}
                  </span>
                </td>
                <td className="px-2 py-3 sm:px-4 sm:py-4">
                  <Link href={`/participants/${ranking.id}`} className="group">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 sm:text-base dark:text-white dark:group-hover:text-blue-400">
                      {ranking.name}
                    </p>
                    <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">Edad: {ranking.age}</p>
                  </Link>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-right text-sm text-gray-500 sm:table-cell dark:text-gray-400">
                  {ranking.initial_weight.toFixed(1)} kg
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-right sm:px-4 sm:py-4">
                  <span className="text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                    {ranking.current_weight.toFixed(1)} kg
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-right sm:px-4 sm:py-4">
                  <WeightDiffBadge
                    diff={ranking.weight_diff}
                    showPercentage
                    percentage={ranking.weight_loss_percentage}
                    size="sm"
                  />
                </td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-right text-sm text-gray-500 md:table-cell dark:text-gray-400">
                  {ranking.total_records}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
        </div>
      </div>
    </div>
  )
}
