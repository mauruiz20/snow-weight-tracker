import { Checkbox } from '@/components/ui'
import { CHART_COLORS } from '@/lib/constants'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

interface MobileNavigationProps {
  participants: string[]
  allParticipants: string[]
  currentIndex: number
  useSwipeMode: boolean
  showAll: boolean
  showMovingAverage: boolean
  showMinMax: boolean
  onShowAllChange: (value: boolean) => void
  onShowMovingAverageChange: (value: boolean) => void
  onShowMinMaxChange: (value: boolean) => void
  onPrev: () => void
  onNext: () => void
  onGoToIndex: (index: number) => void
  isFirst: boolean
  isLast: boolean
}

export const MobileNavigation = ({
  participants,
  allParticipants,
  currentIndex,
  useSwipeMode,
  showAll,
  showMovingAverage,
  showMinMax,
  onShowAllChange,
  onShowMovingAverageChange,
  onShowMinMaxChange,
  onPrev,
  onNext,
  onGoToIndex,
  isFirst,
  isLast
}: MobileNavigationProps) => {
  const currentParticipant = participants[currentIndex]
  const originalIndex = allParticipants.indexOf(currentParticipant)
  const currentColor = CHART_COLORS[originalIndex % CHART_COLORS.length]

  return (
    <div className='mb-3'>
      {/* Swipe mode: Participant name with navigation arrows */}
      {useSwipeMode && (
        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={onPrev}
            disabled={isFirst}
            className='rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800'
            aria-label='Participante anterior'
          >
            <HiChevronLeft className='h-5 w-5' />
          </button>

          <div className='flex flex-col items-center'>
            <span
              className='text-lg font-semibold'
              style={{ color: currentColor }}
            >
              {currentParticipant}
            </span>
            {/* Dot indicators */}
            <div className='mt-1 flex gap-1.5'>
              {participants.map((p, idx) => {
                const pOriginalIndex = allParticipants.indexOf(p)
                const pColor = CHART_COLORS[pOriginalIndex % CHART_COLORS.length]
                return (
                  <button
                    key={p}
                    type='button'
                    onClick={() => onGoToIndex(idx)}
                    className='h-2 w-2 rounded-full transition-all'
                    style={{
                      backgroundColor: idx === currentIndex ? pColor : '#d1d5db',
                      transform: idx === currentIndex ? 'scale(1.25)' : 'scale(1)'
                    }}
                    aria-label={`Ver ${p}`}
                  />
                )
              })}
            </div>
          </div>

          <button
            type='button'
            onClick={onNext}
            disabled={isLast}
            className='rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800'
            aria-label='Siguiente participante'
          >
            <HiChevronRight className='h-5 w-5' />
          </button>
        </div>
      )}

      {/* Show all mode: simple header */}
      {!useSwipeMode && (
        <p className='text-center text-sm font-medium text-gray-700 dark:text-gray-300'>
          Mostrando {participants.length} participantes
        </p>
      )}

      {/* Mobile toggles */}
      <div className='mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1'>
        <Checkbox
          id='show-all-mobile'
          label='Ver todos'
          checked={showAll}
          onChange={(e) => onShowAllChange(e.target.checked)}
          inline
          labelClassName='text-xs'
        />
        <Checkbox
          id='show-moving-average-mobile'
          label='Media móvil'
          checked={showMovingAverage}
          onChange={(e) => onShowMovingAverageChange(e.target.checked)}
          inline
          labelClassName='text-xs'
        />
        <Checkbox
          id='show-min-max-mobile'
          label='Mín/Máx'
          checked={showMinMax}
          onChange={(e) => onShowMinMaxChange(e.target.checked)}
          inline
          labelClassName='text-xs'
        />
      </div>
    </div>
  )
}
