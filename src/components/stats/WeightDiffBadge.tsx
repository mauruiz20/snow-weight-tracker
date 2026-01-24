'use client'

interface WeightDiffBadgeProps {
  diff: number
  showPercentage?: boolean
  percentage?: number
  size?: 'sm' | 'md' | 'lg'
}

export const WeightDiffBadge = ({
  diff,
  showPercentage = false,
  percentage = 0,
  size = 'md',
}: WeightDiffBadgeProps) => {
  const isLoss = diff < 0
  const isGain = diff > 0

  const getBgColor = () => {
    if (isLoss) return 'bg-green-100 dark:bg-green-900/50'
    if (isGain) return 'bg-red-100 dark:bg-red-900/50'
    return 'bg-gray-100 dark:bg-gray-700'
  }

  const getTextColor = () => {
    if (isLoss) return 'text-green-700 dark:text-green-400'
    if (isGain) return 'text-red-700 dark:text-red-400'
    return 'text-gray-700 dark:text-gray-300'
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs'
      case 'lg':
        return 'px-4 py-2 text-base'
      default:
        return 'px-3 py-1 text-sm'
    }
  }

  const formatPercentage = () => {
    const sign = percentage > 0 ? '+' : ''
    return `${sign}${percentage.toFixed(1)}%`
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${getBgColor()} ${getTextColor()} ${getSizeClasses()}`}
    >
      {isLoss && <span>-</span>}
      {isGain && <span>+</span>}
      {!isLoss && !isGain && <span>=</span>}
      <span>{Math.abs(diff).toFixed(2)} kg</span>
      {showPercentage && <span className="opacity-75">({formatPercentage()})</span>}
    </span>
  )
}
