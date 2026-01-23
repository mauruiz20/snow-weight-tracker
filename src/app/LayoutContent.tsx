'use client'

import { LavaBlobs, Loader, SnowAnimation, ThemeToggle } from '@/components/ui'
import { useLoading } from '@/contexts/LoadingContext'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isInitialLoad } = useLoading()

  return (
    <>
      <LavaBlobs />
      {!isInitialLoad && <SnowAnimation />}
      {isInitialLoad && <Loader />}
      <header className='fixed right-2 top-2 z-50 sm:right-4 sm:top-4'>
        <ThemeToggle />
      </header>
      {children}
    </>
  )
}
