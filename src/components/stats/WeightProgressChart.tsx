'use client'

import { useWeightChartData } from '@/hooks/useWeightChartData'
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

const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
]

interface WeightProgressChartProps {
  height?: number
}

export function WeightProgressChart({ height = 350 }: WeightProgressChartProps) {
  const { chartData, participants, loading, error } = useWeightChartData()

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
        {participants.map((participant, index) => (
          <Line
            key={participant}
            type="monotone"
            dataKey={participant}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// --- UI State Components ---

function ChartLoadingState({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}

function ChartErrorState({ message, height }: { message: string; height: number }) {
  return (
    <div className="flex items-center justify-center text-red-500 dark:text-red-400" style={{ height }}>
      <p>Error: {message}</p>
    </div>
  )
}

function ChartEmptyState({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400" style={{ height }}>
      No hay datos de peso registrados aún
    </div>
  )
}
