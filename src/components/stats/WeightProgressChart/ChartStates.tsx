interface ChartStateProps {
  height: number
}

export const ChartLoadingState = ({ height }: ChartStateProps) => (
  <div className='flex items-center justify-center' style={{ height }}>
    <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
  </div>
)

export const ChartErrorState = ({
  message,
  height
}: ChartStateProps & { message: string }) => (
  <div
    className='flex items-center justify-center text-red-500 dark:text-red-400'
    style={{ height }}
  >
    <p>Error: {message}</p>
  </div>
)

export const ChartEmptyState = ({ height }: ChartStateProps) => (
  <div
    className='flex items-center justify-center text-gray-500 dark:text-gray-400'
    style={{ height }}
  >
    No hay datos de peso registrados aún
  </div>
)
