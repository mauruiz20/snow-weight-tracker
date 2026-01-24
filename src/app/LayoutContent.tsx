'use client'

import { LavaBlobs, Loader, SnowAnimation, ThemeToggle } from '@/components/ui'
import { ANIMATION_CONFIG } from '@/lib/constants'
import { useEffect, useState } from 'react'

export const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), ANIMATION_CONFIG.loaderDurationMs)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <LavaBlobs />
      {!isLoading && <SnowAnimation />}
      {isLoading && <Loader />}
      <header className='fixed right-2 top-2 z-50 sm:right-4 sm:top-4'>
        <ThemeToggle />
      </header>
      {children}
    </>
  )
}
