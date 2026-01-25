import { useMemo, useState } from 'react'
import type { ChartDataPoint } from '@/hooks/useWeightChartData'

interface UseChartFiltersProps {
  participants: string[]
  chartData: ChartDataPoint[]
  useSwipeMode: boolean
  mobileParticipantIndex: number
}

export function useChartFilters({
  participants,
  chartData,
  useSwipeMode,
  mobileParticipantIndex
}: UseChartFiltersProps) {
  // Track whether user has made any selection (null = use default "all selected")
  const [userSelection, setUserSelection] = useState<Set<string> | null>(null)

  // Compute effective selection: if userSelection is null, select all
  const selectedParticipants = useMemo(() => {
    if (userSelection === null) {
      return new Set(participants)
    }
    return new Set([...userSelection].filter((p) => participants.includes(p)))
  }, [participants, userSelection])

  // All participants that are currently selected
  const allFilteredParticipants = participants.filter((p) =>
    selectedParticipants.has(p)
  )

  // In swipe mode, show only current participant; otherwise show all selected
  const filteredParticipants = useMemo(() => {
    if (!useSwipeMode || allFilteredParticipants.length === 0) {
      return allFilteredParticipants
    }
    const validIndex = Math.min(
      mobileParticipantIndex,
      allFilteredParticipants.length - 1
    )
    return [allFilteredParticipants[Math.max(0, validIndex)]]
  }, [useSwipeMode, allFilteredParticipants, mobileParticipantIndex])

  // Filter chart data to only include dates where selected participants have data
  const filteredChartData = useMemo(() => {
    if (filteredParticipants.length === 0) return []
    return chartData.filter((point) =>
      filteredParticipants.some((p) => point[p] != null)
    )
  }, [chartData, filteredParticipants])

  const handleParticipantToggle = (participant: string) => {
    setUserSelection((prev) => {
      const current = prev === null ? new Set(participants) : new Set(prev)
      if (current.has(participant)) {
        current.delete(participant)
      } else {
        current.add(participant)
      }
      return current
    })
  }

  const handleSelectAll = () => {
    setUserSelection(null)
  }

  const handleDeselectAll = () => {
    setUserSelection(new Set())
  }

  return {
    selectedParticipants,
    allFilteredParticipants,
    filteredParticipants,
    filteredChartData,
    handleParticipantToggle,
    handleSelectAll,
    handleDeselectAll
  }
}
