import type { Participant, ParticipantRanking, WeightRecord } from '@/types/database.types'

/**
 * Calculate weight difference (positive = gain, negative = loss)
 */
export function calculateWeightDiff(initialWeight: number, currentWeight: number): number {
  return Number((currentWeight - initialWeight).toFixed(2))
}

/**
 * Calculate weight loss percentage (positive = lost weight, negative = gained)
 */
export function calculateWeightLossPercentage(
  initialWeight: number,
  currentWeight: number
): number {
  if (initialWeight <= 0) return 0
  return Number((((initialWeight - currentWeight) / initialWeight) * 100).toFixed(2))
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null
  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(2))
}

/**
 * Get BMI category in Spanish
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Sobrepeso'
  return 'Obesidad'
}

/**
 * Calculate body fat percentage using Deurenberg formula
 * BF% = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4
 * Where Sex = 1 for male, 0 for female
 */
export function calculateBodyFat(
  bmi: number,
  age: number,
  gender: 'male' | 'female'
): number {
  const sexFactor = gender === 'male' ? 1 : 0
  const bodyFat = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4
  return Number(bodyFat.toFixed(1))
}

/**
 * Get body fat category in Spanish
 */
export function getBodyFatCategory(bodyFat: number, gender: 'male' | 'female'): string {
  if (gender === 'male') {
    if (bodyFat < 6) return 'Esencial'
    if (bodyFat < 14) return 'Atleta'
    if (bodyFat < 18) return 'Fitness'
    if (bodyFat < 25) return 'Aceptable'
    return 'Obesidad'
  }
  // Female
  if (bodyFat < 14) return 'Esencial'
  if (bodyFat < 21) return 'Atleta'
  if (bodyFat < 25) return 'Fitness'
  if (bodyFat < 32) return 'Aceptable'
  return 'Obesidad'
}

/**
 * Get the latest weight record from a list
 */
export function getLatestWeight(records: WeightRecord[]): WeightRecord | null {
  if (records.length === 0) return null
  return records.reduce((latest, record) =>
    new Date(record.recorded_at) > new Date(latest.recorded_at) ? record : latest
  )
}

/**
 * Get the current weight for a participant (from records or initial weight)
 */
export function getCurrentWeight(participant: Participant, records: WeightRecord[]): number {
  const latestRecord = getLatestWeight(records.filter((r) => r.participant_id === participant.id))
  return latestRecord ? latestRecord.weight : participant.initial_weight
}

/**
 * Calculate weight stats for a participant
 */
export interface WeightStats {
  currentWeight: number
  weightDiff: number
  weightLossPercentage: number
  minWeight: number | null
  maxWeight: number | null
  totalRecords: number
  currentBMI: number | null
  bmiCategory: string | null
  bodyFatPercentage: number | null
  bodyFatCategory: string | null
}

export function calculateWeightStats(
  participant: Participant,
  records: WeightRecord[]
): WeightStats {
  const participantRecords = records.filter((r) => r.participant_id === participant.id)
  const currentWeight = getCurrentWeight(participant, participantRecords)

  const weights = participantRecords.map((r) => r.weight)
  const minWeight = weights.length > 0 ? Math.min(...weights) : null
  const maxWeight = weights.length > 0 ? Math.max(...weights) : null

  const weightDiff = calculateWeightDiff(participant.initial_weight, currentWeight)
  const weightLossPercentage = calculateWeightLossPercentage(
    participant.initial_weight,
    currentWeight
  )
  const currentBMI = calculateBMI(currentWeight, participant.height)
  const bmiCategory = currentBMI ? getBMICategory(currentBMI) : null
  const bodyFatPercentage = currentBMI ? calculateBodyFat(currentBMI, participant.age, participant.gender) : null
  const bodyFatCategory = bodyFatPercentage ? getBodyFatCategory(bodyFatPercentage, participant.gender) : null

  return {
    currentWeight,
    weightDiff,
    weightLossPercentage,
    minWeight,
    maxWeight,
    totalRecords: participantRecords.length,
    currentBMI,
    bmiCategory,
    bodyFatPercentage,
    bodyFatCategory,
  }
}

/**
 * Format weight difference for display
 */
export function formatWeightDiff(diff: number): string {
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(2)} kg`
}

/**
 * Format weight loss percentage for display
 */
export function formatWeightLossPercentage(percentage: number): string {
  const sign = percentage > 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

/**
 * Get a color class based on weight change
 */
export function getWeightChangeColor(diff: number): string {
  if (diff < 0) return 'text-green-600' // Weight loss
  if (diff > 0) return 'text-red-600' // Weight gain
  return 'text-gray-600' // No change
}

/**
 * Sort rankings by weight loss (best first)
 */
export function sortRankingsByWeightLoss(rankings: ParticipantRanking[]): ParticipantRanking[] {
  return [...rankings].sort((a, b) => a.weight_diff - b.weight_diff)
}

/**
 * Format date for display in Spanish
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format datetime for display in Spanish
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
