'use client'

import { useWeightChartData } from '@/hooks/useWeightChartData'
import { WeightProgressChart } from './WeightProgressChart'
import { WeightTrendsSummary } from './WeightTrendsSummary'

export const WeightProgressSection = () => {
  const { chartData, participants, participantTrends, loading, error } =
    useWeightChartData()

  return (
    <>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
          📈 Progreso de Peso
        </h2>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Evolución del peso de todos los participantes a lo largo del tiempo
        </p>
      </div>
      <WeightTrendsSummary trends={participantTrends} />
      <WeightProgressChart
        chartData={chartData}
        participants={participants}
        loading={loading}
        error={error}
      />
    </>
  )
}
