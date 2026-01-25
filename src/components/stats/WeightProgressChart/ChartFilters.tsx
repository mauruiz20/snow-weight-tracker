import { Checkbox } from '@/components/ui'
import { CHART_COLORS } from '@/lib/constants'

interface ChartFiltersProps {
  participants: string[]
  selectedParticipants: Set<string>
  showMovingAverage: boolean
  showMinMax: boolean
  onParticipantToggle: (participant: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onShowMovingAverageChange: (value: boolean) => void
  onShowMinMaxChange: (value: boolean) => void
}

export const ChartFilters = ({
  participants,
  selectedParticipants,
  showMovingAverage,
  showMinMax,
  onParticipantToggle,
  onSelectAll,
  onDeselectAll,
  onShowMovingAverageChange,
  onShowMinMaxChange
}: ChartFiltersProps) => {
  return (
    <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
      {/* Participant selector */}
      <div className='flex-1'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Filtrar participantes
          </span>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onSelectAll}
              className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              Todos
            </button>
            <span className='text-xs text-gray-400'>|</span>
            <button
              type='button'
              onClick={onDeselectAll}
              className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              Ninguno
            </button>
          </div>
        </div>
        <div className='w-fit flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50'>
          {participants.map((participant, index) => {
            const isSelected = selectedParticipants.has(participant)
            const color = CHART_COLORS[index % CHART_COLORS.length]
            return (
              <div
                key={participant}
                className='rounded-md border px-2 py-1 text-sm transition-colors'
                style={{
                  borderColor: isSelected ? color : 'transparent',
                  backgroundColor: isSelected ? `${color}15` : 'transparent'
                }}
              >
                <Checkbox
                  id={`participant-${participant}`}
                  label={participant}
                  checked={isSelected}
                  onChange={() => onParticipantToggle(participant)}
                  inline
                  labelClassName='text-sm m-0'
                  labelStyle={{
                    color: isSelected ? color : undefined,
                    fontWeight: isSelected ? 600 : 400
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Toggles for desktop */}
      <div className='flex flex-col gap-2'>
        <Checkbox
          id='show-moving-average'
          label='Mostrar media móvil'
          checked={showMovingAverage}
          onChange={(e) => onShowMovingAverageChange(e.target.checked)}
          inline
        />
        <Checkbox
          id='show-min-max'
          label='Mostrar mín/máx'
          checked={showMinMax}
          onChange={(e) => onShowMinMaxChange(e.target.checked)}
          inline
        />
      </div>
    </div>
  )
}
