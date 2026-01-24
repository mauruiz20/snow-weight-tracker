'use client'

import type { ChartDataPoint } from '@/hooks/useWeightChartData'
import {
  CHART_MA_SUFFIX,
  useWeightChartData,
} from '@/hooks/useWeightChartData'
import { CHART_COLORS, CHART_CONFIG, isMobile } from '@/lib/constants'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  error: errorProp,
}: WeightProgressChartProps) => {
  const hook = useWeightChartData()
  const chartData = chartDataProp ?? hook.chartData
  const participants = participantsProp ?? hook.participants
  const loading = loadingProp ?? hook.loading
  const error = errorProp ?? hook.error

  // Hide moving average by default on mobile (less clutter)
  const [showMovingAverage, setShowMovingAverage] = useState(true)

  useEffect(() => {
    // Default to hidden on mobile
    setShowMovingAverage(!isMobile())
  }, [])

  if (loading) {
    return <ChartLoadingState height={height} />
  }

  if (error) {
    return <ChartErrorState message={error} height={height} />
  }

  if (chartData.length === 0) {
    return <ChartEmptyState height={height} />
  }

  return (
    <div>
      {/* Toggle for moving average */}
      <div className="mb-3 flex items-center justify-end">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showMovingAverage}
            onChange={(e) => setShowMovingAverage(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          Mostrar media móvil
        </label>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
          stroke="currentColor"
        />
        <YAxis
          domain={['dataMin - 2', 'dataMax + 2']}
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
          stroke="currentColor"
          tickFormatter={(value) => `${value}kg`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
          formatter={(value: number, name: string) => [`${value.toFixed(1)} kg`, name]}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        {participants.map((participant, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length]
          return (
            <Line
              key={participant}
              type="monotone"
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
        {showMovingAverage && participants.map((participant, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length]
          return (
            <Line
              key={`${participant}${CHART_MA_SUFFIX}`}
              type="monotone"
              dataKey={participant + CHART_MA_SUFFIX}
              name={`${participant} (media móvil)`}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5 5"
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
  <div className="flex items-center justify-center" style={{ height }}>
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
  </div>
)

const ChartErrorState = ({ message, height }: { message: string; height: number }) => (
  <div className="flex items-center justify-center text-red-500 dark:text-red-400" style={{ height }}>
    <p>Error: {message}</p>
  </div>
)

const ChartEmptyState = ({ height }: { height: number }) => (
  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400" style={{ height }}>
    No hay datos de peso registrados aún
  </div>
)
