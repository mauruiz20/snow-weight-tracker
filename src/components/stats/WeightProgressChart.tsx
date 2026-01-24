'use client'

import type { ChartDataPoint } from '@/hooks/useWeightChartData'
import { CHART_MA_SUFFIX, useWeightChartData } from '@/hooks/useWeightChartData'
import { Checkbox } from '@/components/ui'
import { CHART_COLORS, CHART_CONFIG, isMobile } from '@/lib/constants'
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface WeightProgressChartProps {
  height?: number
  chartData?: ChartDataPoint[]
  participants?: string[]
  loading?: boolean
  error?: string | null
}

export const WeightProgressChart = ({
  height = CHART_CONFIG.defaultHeight,
  chartData: chartDataProp,
  participants: participantsProp,
  loading: loadingProp,
  error: errorProp
}: WeightProgressChartProps) => {
  const hook = useWeightChartData()
  const chartData = chartDataProp ?? hook.chartData
  const participants = participantsProp ?? hook.participants
  const loading = loadingProp ?? hook.loading
  const error = errorProp ?? hook.error

  // Hide moving average by default on mobile (less clutter)
  const [showMovingAverage, setShowMovingAverage] = useState(() => !isMobile())
  // User's explicit selection (empty means "all selected")
  const [userSelection, setUserSelection] = useState<Set<string>>(
    () => new Set()
  )

  // Compute effective selection: if userSelection is empty, select all; otherwise use intersection
  // If userSelection equals all participants, that means "none selected" (special case)
  const selectedParticipants = useMemo(() => {
    if (userSelection.size === 0) {
      return new Set(participants)
    }
    // If userSelection contains all participants, that's the "deselect all" state
    if (
      userSelection.size === participants.length &&
      participants.every((p) => userSelection.has(p))
    ) {
      return new Set<string>()
    }
    return new Set(participants.filter((p) => userSelection.has(p)))
  }, [participants, userSelection])

  // Filter participants for display
  const filteredParticipants = participants.filter((p) =>
    selectedParticipants.has(p)
  )

  if (loading) {
    return <ChartLoadingState height={height} />
  }

  if (error) {
    return <ChartErrorState message={error} height={height} />
  }

  if (chartData.length === 0) {
    return <ChartEmptyState height={height} />
  }

  const handleParticipantToggle = (participant: string) => {
    setUserSelection((prev) => {
      const updated = new Set(prev)
      const isDeselectAllState =
        prev.size === participants.length &&
        participants.every((p) => prev.has(p))

      // If we're in "deselect all" state, initialize with empty (meaning "all selected")
      // then remove this one to mean "all except this one"
      if (isDeselectAllState) {
        updated.clear()
        for (const p of participants) {
          if (p !== participant) {
            updated.add(p)
          }
        }
        return updated
      }

      // If this is the first toggle (empty = all selected), initialize with all
      if (prev.size === 0) {
        for (const p of participants) {
          updated.add(p)
        }
      }

      // Toggle this participant
      if (updated.has(participant)) {
        updated.delete(participant)
      } else {
        updated.add(participant)
      }

      // If all are selected, clear selection to mean "all"
      if (
        updated.size === participants.length &&
        participants.every((p) => updated.has(p))
      ) {
        return new Set()
      }

      return updated
    })
  }

  const handleSelectAll = () => {
    setUserSelection(new Set())
  }

  const handleDeselectAll = () => {
    // Set userSelection to all participants, which means none will be in the intersection
    // But we need to track this differently - use a Set with all participants to mean "none selected"
    // Actually, let's use a different approach: track excluded participants
    setUserSelection(new Set(participants))
  }

  return (
    <div>
      {/* Filters */}
      <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        {/* Participant selector */}
        <div className='flex-1'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Filtrar participantes
            </span>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handleSelectAll}
                className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Todos
              </button>
              <span className='text-xs text-gray-400'>|</span>
              <button
                type='button'
                onClick={handleDeselectAll}
                className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Ninguno
              </button>
            </div>
          </div>
          <div className='w-fit flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50'>
            {participants.map((participant, index) => {
              const isSelected = selectedParticipants.has(participant)
              const color = CHART_COLORS[index % CHART_COLORS.length]
              return (
                <div
                  key={participant}
                  className='rounded-md border px-2 py-1 text-sm transition-colors'
                  style={{
                    borderColor: isSelected ? color : 'transparent',
                    backgroundColor: isSelected ? `${color}15` : 'transparent'
                  }}
                >
                  <Checkbox
                    id={`participant-${participant}`}
                    label={participant}
                    checked={isSelected}
                    onChange={() => handleParticipantToggle(participant)}
                    inline
                    labelClassName='text-sm m-0'
                    labelStyle={{
                      color: isSelected ? color : undefined,
                      fontWeight: isSelected ? 600 : 400
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Toggle for moving average */}
        <div className='flex items-center justify-end sm:justify-end'>
          <Checkbox
            id='show-moving-average'
            label='Mostrar media móvil'
            checked={showMovingAverage}
            onChange={(e) => setShowMovingAverage(e.target.checked)}
            inline
          />
        </div>
      </div>

      <ResponsiveContainer width='100%' height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            className='stroke-gray-200 dark:stroke-gray-700'
          />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 12 }}
            className='text-gray-600 dark:text-gray-400'
            stroke='currentColor'
          />
          <YAxis
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fontSize: 12 }}
            className='text-gray-600 dark:text-gray-400'
            stroke='currentColor'
            tickFormatter={(value) => `${value}kg`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)} kg`,
              name
            ]}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {filteredParticipants.map((participant) => {
            const originalIndex = participants.indexOf(participant)
            const color = CHART_COLORS[originalIndex % CHART_COLORS.length]
            return (
              <Line
                key={participant}
                type='monotone'
                dataKey={participant}
                name={participant}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            )
          })}
          {showMovingAverage &&
            filteredParticipants.map((participant) => {
              const originalIndex = participants.indexOf(participant)
              const color = CHART_COLORS[originalIndex % CHART_COLORS.length]
              return (
                <Line
                  key={`${participant}${CHART_MA_SUFFIX}`}
                  type='monotone'
                  dataKey={participant + CHART_MA_SUFFIX}
                  name={`${participant} (media móvil)`}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray='5 5'
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              )
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// --- UI State Components ---

const ChartLoadingState = ({ height }: { height: number }) => (
  <div className='flex items-center justify-center' style={{ height }}>
    <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
  </div>
)

const ChartErrorState = ({
  message,
  height
}: {
  message: string
  height: number
}) => (
  <div
    className='flex items-center justify-center text-red-500 dark:text-red-400'
    style={{ height }}
  >
    <p>Error: {message}</p>
  </div>
)

const ChartEmptyState = ({ height }: { height: number }) => (
  <div
    className='flex items-center justify-center text-gray-500 dark:text-gray-400'
    style={{ height }}
  >
    No hay datos de peso registrados aún
  </div>
)
