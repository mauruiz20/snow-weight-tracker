import { useMemo } from 'react'
import type { ChartDataPoint } from '@/hooks/useWeightChartData'
import { CHART_COLORS } from '@/lib/constants'

export interface MinMaxMarker {
  participant: string
  type: 'min' | 'max'
  date: string
  value: number
  color: string
}

interface UseMinMaxMarkersProps {
  filteredParticipants: string[]
  filteredChartData: ChartDataPoint[]
  allParticipants: string[]
}

export function useMinMaxMarkers({
  filteredParticipants,
  filteredChartData,
  allParticipants
}: UseMinMaxMarkersProps): MinMaxMarker[] {
  return useMemo(() => {
    const markers: MinMaxMarker[] = []

    for (const participant of filteredParticipants) {
      const originalIndex = allParticipants.indexOf(participant)
      const color = CHART_COLORS[originalIndex % CHART_COLORS.length]

      let min: { date: string; value: number } | null = null
      let max: { date: string; value: number } | null = null

      for (const point of filteredChartData) {
        const rawValue = point[participant]
        if (rawValue == null || typeof rawValue !== 'number') continue
        const value = rawValue

        if (min === null || value < min.value) {
          min = { date: point.date, value }
        }
        if (max === null || value > max.value) {
          max = { date: point.date, value }
        }
      }

      // Use participant's color for both min and max
      if (min) markers.push({ participant, type: 'min', ...min, color })
      if (max && max.date !== min?.date) {
        markers.push({ participant, type: 'max', ...max, color })
      }
    }

    return markers
  }, [filteredParticipants, filteredChartData, allParticipants])
}
