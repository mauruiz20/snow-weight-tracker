'use client'

import {
  fetchParticipantsWithInitialWeight,
  fetchWeightRecordsWithParticipants,
} from '@/lib/api'
import type { TrendResult } from '@/utils/weight-trend'
import {
  buildWeightSeries,
  computeMovingAverage,
  computeTrend,
} from '@/utils/weight-trend'
import { useCallback, useEffect, useState } from 'react'

interface WeightEntry {
  participantId: string
  participantName: string
  weight: number
  recordedAt: string
}

export const CHART_MA_SUFFIX = ' (media)'

export interface ChartDataPoint {
  date: string
  timestamp: number
  [key: string]: string | number
}

export interface UseWeightChartDataReturn {
  chartData: ChartDataPoint[]
  participants: string[]
  participantTrends: Record<string, TrendResult>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Fetches all weight records with participant info and transforms them for chart display
 */
export function useWeightChartData(): UseWeightChartDataReturn {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [participantTrends, setParticipantTrends] = useState<Record<string, TrendResult>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [records, participantsData] = await Promise.all([
        fetchWeightRecordsWithParticipants(),
        fetchParticipantsWithInitialWeight(),
      ])

      const entries = transformToEntries(records, participantsData)
      const uniqueParticipants = [...new Set(entries.map((e) => e.participantName))]
      setParticipants(uniqueParticipants)

      let data = transformToChartData(entries, uniqueParticipants)
      data = addMovingAverageToChartData(data, entries, participantsData, uniqueParticipants)

      const trends: Record<string, TrendResult> = {}
      for (const p of participantsData) {
        const partEntries = entries.filter((e) => e.participantId === p.id)
        const recordsOnly = partEntries
          .filter((e) => !(e.recordedAt === p.created_at && e.weight === p.initial_weight))
          .map((e) => ({ weight: e.weight, recorded_at: e.recordedAt }))
        const series = buildWeightSeries(p.initial_weight, p.created_at, recordsOnly)
        trends[p.name] = computeTrend(series)
      }
      setParticipantTrends(trends)
      setChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del gráfico')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    chartData,
    participants,
    participantTrends,
    loading,
    error,
    refetch: fetchData,
  }
}

/**
 * Transforms raw database records into normalized weight entries
 */
function transformToEntries(
  records: Array<{
    participant_id: string
    weight: number
    recorded_at: string
    participants: { name: string } | null
  }>,
  participantsData: Array<{
    id: string
    name: string
    initial_weight: number
    created_at: string
  }>
): WeightEntry[] {
  const entries: WeightEntry[] = []

  // Add initial weights as first data points
  for (const p of participantsData) {
    entries.push({
      participantId: p.id,
      participantName: p.name,
      weight: p.initial_weight,
      recordedAt: p.created_at,
    })
  }

  // Add weight records
  for (const r of records) {
    entries.push({
      participantId: r.participant_id,
      participantName: r.participants?.name || 'Desconocido',
      weight: r.weight,
      recordedAt: r.recorded_at,
    })
  }

  // Sort by date
  entries.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())

  return entries
}

/**
 * Transforms weight entries into chart-ready data points grouped by date
 */
function transformToChartData(
  entries: WeightEntry[],
  participants: string[]
): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>()

  for (const entry of entries) {
    const date = new Date(entry.recordedAt)
    const dateKey = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    })

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        timestamp: date.getTime(),
      })
    }

    const point = dateMap.get(dateKey)
    if (point) {
      point[entry.participantName] = entry.weight
    }
  }

  // Convert to array and fill missing values for continuous lines
  const chartData = Array.from(dateMap.values())
  fillMissingValues(chartData, participants)

  return chartData
}

/**
 * Fills missing values in chart data with previous values for continuous lines
 */
function fillMissingValues(chartData: ChartDataPoint[], participants: string[]): void {
  const lastValues: Record<string, number> = {}

  for (const point of chartData) {
    for (const participant of participants) {
      if (point[participant] !== undefined) {
        lastValues[participant] = point[participant] as number
      } else if (lastValues[participant] !== undefined) {
        point[participant] = lastValues[participant]
      }
    }
  }
}

function dateKey(ms: number): string {
  return new Date(ms).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

/**
 * Adds moving average (media) series per participant; N=7, min 3 points.
 */
function addMovingAverageToChartData(
  chartData: ChartDataPoint[],
  entries: WeightEntry[],
  participantsData: Array<{ id: string; name: string; initial_weight: number; created_at: string }>,
  participants: string[]
): ChartDataPoint[] {
  const sorted = [...chartData].sort((a, b) => (a.timestamp as number) - (b.timestamp as number))
  const byName = new Map(
    participantsData.map((p) => [p.name, p])
  )

  for (const name of participants) {
    const p = byName.get(name)
    if (!p) continue
    const partEntries = entries.filter((e) => e.participantId === p.id)
    const recordsOnly = partEntries
      .filter((e) => !(e.recordedAt === p.created_at && e.weight === p.initial_weight))
      .map((e) => ({ weight: e.weight, recorded_at: e.recordedAt }))
    const series = buildWeightSeries(p.initial_weight, p.created_at, recordsOnly)
    const maSeries = computeMovingAverage(series, 7, 3)
    const maByDate = new Map(maSeries.map((m) => [dateKey(m.timestampMs), m.weight]))

    let lastMa: number | undefined
    const key = name + CHART_MA_SUFFIX
    for (const point of sorted) {
      const d = point.date
      const v = maByDate.get(d)
      if (v !== undefined) {
        lastMa = v
        point[key] = v
      } else if (lastMa !== undefined) {
        point[key] = lastMa
      }
    }
  }
  return sorted
}
