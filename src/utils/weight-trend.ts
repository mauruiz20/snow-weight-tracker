/**
 * Weight trend analysis: WLS, moving average, and prediction.
 * Robust to fast initial drop, plateaus, sparse/irregular records, and outliers.
 */

import { LOCALE, TARGET_DATE, TREND_CONFIG } from '@/lib/constants'

const {
  tauDays: TAU_DAYS,
  maxTrendKgPerWeek: MAX_TREND_ABS_KG_PER_WEEK,
  outlierThresholdKg: OUTLIER_THRESHOLD_KG,
  outlierWeightFactor: OUTLIER_WEIGHT_FACTOR,
  movingAverageWindow: MA_WINDOW,
  movingAverageMinPoints: MA_MIN_POINTS,
} = TREND_CONFIG

export interface WeightPoint {
  timestampMs: number
  weight: number
}

export type TrendMethod = 'wls' | 'simple' | 'recent_window' | 'insufficient'

export interface TrendResult {
  trendKgPerWeek: number
  method: TrendMethod
  predictedWeight: number | null
  currentWeight: number
  targetDate: Date
  isInitialEstimate: boolean
}

/**
 * Build a sorted, deduplicated time series from initial weight + records.
 * Same-day entries: use the latest value.
 */
export function buildWeightSeries(
  initialWeight: number,
  initialDate: string,
  records: Array<{ weight: number; recorded_at: string }>
): WeightPoint[] {
  const points: WeightPoint[] = [
    { timestampMs: new Date(initialDate).getTime(), weight: initialWeight },
  ]
  for (const r of records) {
    points.push({ timestampMs: new Date(r.recorded_at).getTime(), weight: r.weight })
  }
  points.sort((a, b) => a.timestampMs - b.timestampMs)

  // Same timestamp: keep latest
  const byDay = new Map<number, number>()
  for (const p of points) {
    const day = Math.floor(p.timestampMs / (24 * 60 * 60 * 1000))
    const existing = byDay.get(day)
    if (existing === undefined) {
      byDay.set(day, p.weight)
    } else {
      byDay.set(day, p.weight) // "use latest" per spec
    }
  }
  const sortedDays = [...byDay.keys()].sort((a, b) => a - b)
  return sortedDays.map((d) => ({
    timestampMs: d * 24 * 60 * 60 * 1000,
    weight: byDay.get(d) ?? 0,
  }))
}

/**
 * Moving average over last N points (default 7), min 3 points.
 * Returns new array of { timestampMs, weight } with weight = MA at that point.
 */
export function computeMovingAverage(
  series: WeightPoint[],
  windowPoints = MA_WINDOW,
  minPoints = MA_MIN_POINTS
): WeightPoint[] {
  const n = series.length
  if (n === 0) return []
  const k = Math.min(Math.max(minPoints, Math.min(windowPoints, n)), n)
  const out: WeightPoint[] = []

  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - k + 1)
    const slice = series.slice(start, i + 1)
    const sum = slice.reduce((s, p) => s + p.weight, 0)
    out.push({
      timestampMs: series[i].timestampMs,
      weight: sum / slice.length,
    })
  }
  return out
}

/**
 * Detect outliers by comparing each point to the moving average.
 * Returns array of booleans indicating if each point is an outlier.
 */
function detectOutliers(
  series: WeightPoint[],
  maSeries: WeightPoint[],
  thresholdKg: number
): boolean[] {
  const outliers: boolean[] = new Array(series.length).fill(false)

  // Build a map of MA values by timestamp for quick lookup
  const maByTimestamp = new Map<number, number>()
  for (const ma of maSeries) {
    maByTimestamp.set(ma.timestampMs, ma.weight)
  }

  for (let i = 0; i < series.length; i++) {
    const maValue = maByTimestamp.get(series[i].timestampMs)
    if (maValue !== undefined) {
      const deviation = Math.abs(series[i].weight - maValue)
      if (deviation > thresholdKg) {
        outliers[i] = true
      }
    }
  }

  return outliers
}

/**
 * Weighted Linear Regression: weight = a + b * time_days.
 * Weights: w_i = exp(-(deltaDays_i / tau)), deltaDays = days from most recent.
 * Outliers (points deviating > threshold from MA) have reduced weight.
 * Returns slope in kg/day.
 */
function weightedLinearRegression(
  series: WeightPoint[],
  tauDays: number,
  outliers?: boolean[]
): number | null {
  const n = series.length
  if (n < 2) return null

  const t0 = series[0].timestampMs
  const tLast = series[n - 1].timestampMs
  const dayMs = 24 * 60 * 60 * 1000

  const x: number[] = []
  const y: number[] = []
  const w: number[] = []

  for (let i = 0; i < n; i++) {
    const days = (series[i].timestampMs - t0) / dayMs
    const daysFromRecent = (tLast - series[i].timestampMs) / dayMs
    x.push(days)
    y.push(series[i].weight)

    // Base weight from exponential decay
    let weight = Math.exp(-daysFromRecent / tauDays)

    // Reduce weight if this point is an outlier
    if (outliers?.[i]) {
      weight *= OUTLIER_WEIGHT_FACTOR
    }

    w.push(weight)
  }

  let sw = 0
  let swx = 0
  let swy = 0
  let swx2 = 0
  let swxy = 0
  for (let i = 0; i < n; i++) {
    sw += w[i]
    swx += w[i] * x[i]
    swy += w[i] * y[i]
    swx2 += w[i] * x[i] * x[i]
    swxy += w[i] * x[i] * y[i]
  }

  const denom = sw * swx2 - swx * swx
  if (Math.abs(denom) < 1e-10) return null
  const slope = (sw * swxy - swx * swy) / denom
  return slope
}

/**
 * Simple slope (last - first) / days. No weighting.
 */
function simpleSlopeKgPerDay(series: WeightPoint[]): number {
  if (series.length < 2) return 0
  const t0 = series[0].timestampMs
  const t1 = series[series.length - 1].timestampMs
  const dayMs = 24 * 60 * 60 * 1000
  const days = (t1 - t0) / dayMs
  if (days <= 0) return 0
  return (series[series.length - 1].weight - series[0].weight) / days
}

/**
 * Recent-window slope: use last K weeks of data only.
 */
function recentWindowSlope(series: WeightPoint[], windowDays: number): number | null {
  const dayMs = 24 * 60 * 60 * 1000
  const cutoff = series[series.length - 1].timestampMs - windowDays * dayMs
  const recent = series.filter((p) => p.timestampMs >= cutoff)
  if (recent.length < 2) return null
  return simpleSlopeKgPerDay(recent)
}

/**
 * Compute robust trend and optional prediction.
 * - < 2 points: insufficient
 * - 2–3 points: simple trend, isInitialEstimate true
 * - >= 4 points: WLS with tau=21; fallback to recent-window (e.g. 6 weeks) if needed
 */
export function computeTrend(
  series: WeightPoint[],
  targetDate: Date = TARGET_DATE
): TrendResult {
  const currentWeight = series.length > 0 ? series[series.length - 1].weight : 0

  if (series.length < 2) {
    return {
      trendKgPerWeek: 0,
      method: 'insufficient',
      predictedWeight: null,
      currentWeight,
      targetDate,
      isInitialEstimate: false,
    }
  }

  if (series.length <= 3) {
    const slopePerDay = simpleSlopeKgPerDay(series)
    const trendKgPerWeek = slopePerDay * 7
    const clamped = Math.max(
      -MAX_TREND_ABS_KG_PER_WEEK,
      Math.min(MAX_TREND_ABS_KG_PER_WEEK, trendKgPerWeek)
    )
    const predicted = predictWeight(currentWeight, clamped, targetDate)
    return {
      trendKgPerWeek: clamped,
      method: 'simple',
      predictedWeight: predicted,
      currentWeight,
      targetDate,
      isInitialEstimate: true,
    }
  }

  // Compute moving average and detect outliers for robust WLS
  const maSeries = computeMovingAverage(series, 7, 3)
  const outliers = detectOutliers(series, maSeries, OUTLIER_THRESHOLD_KG)

  let slopeKgPerDay = weightedLinearRegression(series, TAU_DAYS, outliers)
  let method: TrendMethod = 'wls'

  if (slopeKgPerDay === null || !Number.isFinite(slopeKgPerDay)) {
    slopeKgPerDay = recentWindowSlope(series, 6 * 7) ?? simpleSlopeKgPerDay(series)
    method = 'recent_window'
  }

  const trendKgPerWeek = slopeKgPerDay * 7
  const clamped = Math.max(
    -MAX_TREND_ABS_KG_PER_WEEK,
    Math.min(MAX_TREND_ABS_KG_PER_WEEK, trendKgPerWeek)
  )
  const predicted = predictWeight(currentWeight, clamped, targetDate)

  return {
    trendKgPerWeek: clamped,
    method,
    predictedWeight: predicted,
    currentWeight,
    targetDate,
    isInitialEstimate: false,
  }
}

/**
 * predicted_weight = current_weight + trend_kg_per_week * weeks_until_target
 */
export function predictWeight(
  currentWeight: number,
  trendKgPerWeek: number,
  targetDate: Date
): number {
  const now = Date.now()
  const targetMs = targetDate.getTime()
  const weeks = (targetMs - now) / (7 * 24 * 60 * 60 * 1000)
  return Number((currentWeight + trendKgPerWeek * weeks).toFixed(1))
}

export type TrendDirection = 'down' | 'up' | 'neutral'

export interface FormattedTrend {
  direction: TrendDirection
  value: string
  label: string
}

export function formatTrendLabel(trendKgPerWeek: number): FormattedTrend {
  const abs = Math.abs(trendKgPerWeek)
  const value = abs.toFixed(2)
  const label = `${value} kg/semana`

  if (trendKgPerWeek < 0) return { direction: 'down', value, label }
  if (trendKgPerWeek > 0) return { direction: 'up', value, label }
  return { direction: 'neutral', value: '0.00', label: '0.00 kg/semana' }
}

export function formatTargetDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
