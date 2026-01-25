import type { FormattedTrend } from '@/utils/weight-trend'
import { HiArrowTrendingDown, HiArrowTrendingUp, HiMinus } from 'react-icons/hi2'

interface TrendLabelProps {
  trend: FormattedTrend
  className?: string
}

export const TrendLabel = ({ trend, className = '' }: TrendLabelProps) => {
  const { direction, label } = trend

  const Icon =
    direction === 'down'
      ? HiArrowTrendingDown
      : direction === 'up'
        ? HiArrowTrendingUp
        : HiMinus

  const colorClass =
    direction === 'down'
      ? 'text-green-600 dark:text-green-400'
      : direction === 'up'
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-600 dark:text-gray-400'

  return (
    <span className={`inline-flex items-center gap-1 ${colorClass} ${className}`}>
      <Icon className='h-5 w-5' />
      <span>{label}</span>
    </span>
  )
}
