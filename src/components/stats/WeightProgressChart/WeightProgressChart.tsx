'use client'

import type { ChartDataPoint } from '@/hooks/useWeightChartData'
import { CHART_MA_SUFFIX, useWeightChartData } from '@/hooks/useWeightChartData'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { CHART_COLORS, CHART_CONFIG } from '@/lib/constants'
import { useRef, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { ChartEmptyState, ChartErrorState, ChartLoadingState } from './ChartStates'
import { ChartFilters } from './ChartFilters'
import { MobileNavigation } from './MobileNavigation'
import { useChartFilters } from './useChartFilters'
import { useMinMaxMarkers } from './useMinMaxMarkers'
import { useSwipeNavigation } from './useSwipeNavigation'

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
  // Data from hook or props
  const hook = useWeightChartData()
  const chartData = chartDataProp ?? hook.chartData
  const participants = participantsProp ?? hook.participants
  const loading = loadingProp ?? hook.loading
  const error = errorProp ?? hook.error

  // Mobile detection (reactive to window resize)
  const mobile = useIsMobile()

  // Display toggles
  const [showMovingAverage, setShowMovingAverage] = useState(!mobile)
  const [showMinMax, setShowMinMax] = useState(true)
  const [mobileShowAll, setMobileShowAll] = useState(false)

  // Swipe mode: only on mobile when not showing all
  const useSwipeMode = mobile && !mobileShowAll

  // Swipe navigation
  const swipeNav = useSwipeNavigation({
    totalItems: participants.length
  })

  // Chart filters (participant selection, data filtering)
  const filters = useChartFilters({
    participants,
    chartData,
    useSwipeMode,
    mobileParticipantIndex: swipeNav.currentIndex
  })

  // Min/max markers
  const minMaxMarkers = useMinMaxMarkers({
    filteredParticipants: filters.filteredParticipants,
    filteredChartData: filters.filteredChartData,
    allParticipants: participants
  })

  // Ref for touch container
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Loading/error/empty states
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
      {/* Desktop Filters */}
      {!mobile && (
        <ChartFilters
          participants={participants}
          selectedParticipants={filters.selectedParticipants}
          showMovingAverage={showMovingAverage}
          showMinMax={showMinMax}
          onParticipantToggle={filters.handleParticipantToggle}
          onSelectAll={filters.handleSelectAll}
          onDeselectAll={filters.handleDeselectAll}
          onShowMovingAverageChange={setShowMovingAverage}
          onShowMinMaxChange={setShowMinMax}
        />
      )}

      {/* Mobile Navigation */}
      {mobile && filters.allFilteredParticipants.length > 0 && (
        <MobileNavigation
          participants={filters.allFilteredParticipants}
          allParticipants={participants}
          currentIndex={swipeNav.currentIndex}
          useSwipeMode={useSwipeMode}
          showAll={mobileShowAll}
          showMovingAverage={showMovingAverage}
          showMinMax={showMinMax}
          onShowAllChange={setMobileShowAll}
          onShowMovingAverageChange={setShowMovingAverage}
          onShowMinMaxChange={setShowMinMax}
          onPrev={swipeNav.goToPrev}
          onNext={swipeNav.goToNext}
          onGoToIndex={swipeNav.goToIndex}
          isFirst={swipeNav.isFirst}
          isLast={swipeNav.isLast}
        />
      )}

      {/* Chart */}
      <div
        ref={chartContainerRef}
        onTouchStart={useSwipeMode ? swipeNav.handleTouchStart : undefined}
        onTouchEnd={useSwipeMode ? swipeNav.handleTouchEnd : undefined}
        className={useSwipeMode ? 'touch-pan-y' : ''}
      >
        <ResponsiveContainer width='100%' height={mobile ? 280 : height}>
          <LineChart
            data={filters.filteredChartData}
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

            {/* Legend - hidden in swipe mode */}
            {!useSwipeMode && <Legend wrapperStyle={{ paddingTop: '10px' }} />}

            {/* Weight lines */}
            {filters.filteredParticipants.map((participant) => {
              const originalIndex = participants.indexOf(participant)
              const color = CHART_COLORS[originalIndex % CHART_COLORS.length]
              return (
                <Line
                  key={participant}
                  type='monotone'
                  dataKey={participant}
                  name={participant}
                  stroke={color}
                  strokeWidth={mobile ? 2.5 : 2}
                  dot={mobile ? false : { r: 4 }}
                  activeDot={{ r: mobile ? 5 : 6 }}
                  connectNulls
                />
              )
            })}

            {/* Moving average lines */}
            {showMovingAverage &&
              filters.filteredParticipants.map((participant) => {
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

            {/* Min/Max markers - using participant's color */}
            {showMinMax &&
              minMaxMarkers.map((marker) => (
                <ReferenceDot
                  key={`${marker.participant}-${marker.type}`}
                  x={marker.date}
                  y={marker.value}
                  r={6}
                  fill={marker.color}
                  stroke='white'
                  strokeWidth={2}
                  label={{
                    value: `${marker.value.toFixed(1)}`,
                    position: marker.type === 'min' ? 'bottom' : 'top',
                    fill: marker.color,
                    fontSize: 11,
                    fontWeight: 600
                  }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
