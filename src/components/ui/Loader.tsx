'use client'

interface LoaderProps {
  isVisible?: boolean
}

export const Loader = ({ isVisible = true }: LoaderProps) => {
  if (!isVisible) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300 dark:bg-gray-900/90'>
      <div className='flex flex-col items-center gap-4'>
        <div className='relative h-16 w-16'>
          <div className='absolute inset-0 animate-spin rounded-full border-4 border-blue-200 dark:border-blue-800' />
          <div className='absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400' />
        </div>
      </div>
    </div>
  )
}
