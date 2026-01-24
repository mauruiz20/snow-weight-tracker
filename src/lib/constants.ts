/**
 * Global constants for the Snow Weight Tracker app
 */

// ===== LOCALE =====
export const LOCALE = 'es-ES'

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const

export const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.mobile

export const isTablet = () =>
  typeof window !== 'undefined' &&
  window.innerWidth >= BREAKPOINTS.mobile &&
  window.innerWidth < BREAKPOINTS.tablet

export const isDesktop = () =>
  typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.tablet

// ===== DATES =====
export const TARGET_DATE = new Date('2026-08-01T00:00:00')

// ===== ROUTES =====
export const ROUTES = {
  home: '/',
  participants: '/participants',
  participantNew: '/participants/new',
  participant: (id: string) => `/participants/${id}`,
} as const

// ===== EXTERNAL LINKS =====
export const EXTERNAL_LINKS = {
  github: 'https://github.com',
} as const

// ===== CHART COLORS =====
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
] as const

// ===== WEIGHT TREND CALCULATION =====
export const TREND_CONFIG = {
  /** Decay half-life for WLS weighting (days) */
  tauDays: 21,
  /** Maximum trend magnitude to display (kg/week) */
  maxTrendKgPerWeek: 2,
  /** Deviation from MA to consider outlier (kg) */
  outlierThresholdKg: 3,
  /** Weight factor for outliers (reduces influence) */
  outlierWeightFactor: 0.1,
  /** Default moving average window size */
  movingAverageWindow: 7,
  /** Minimum points for moving average */
  movingAverageMinPoints: 3,
} as const

// ===== ANIMATION =====
export const ANIMATION_CONFIG = {
  /** Snowflake count on desktop */
  snowflakesDesktop: 25,
  /** Snowflake count on mobile */
  snowflakesMobile: 8,
  /** Initial loader display duration (ms) */
  loaderDurationMs: 500,
  /** Countdown update interval (ms) */
  countdownIntervalMs: 1000,
} as const

// ===== CHART =====
export const CHART_CONFIG = {
  /** Default chart height in pixels */
  defaultHeight: 350,
  /** Minimum table width for mobile scroll */
  minTableWidth: 700,
} as const

// ===== FORMATTING =====
export const FORMAT_CONFIG = {
  /** Decimal places for weight display */
  weightDecimals: 2,
  /** Decimal places for weight in charts/summaries */
  weightDecimalsShort: 1,
  /** Decimal places for percentage display */
  percentageDecimals: 2,
  /** Decimal places for BMI display */
  bmiDecimals: 2,
} as const
