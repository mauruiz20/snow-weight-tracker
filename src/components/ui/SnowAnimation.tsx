'use client'

import { useIsMobile } from '@/hooks/useBreakpoint'
import { ANIMATION_CONFIG } from '@/lib/constants'
import { useMemo } from 'react'

interface Snowflake {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
}

function generateSnowflakes(mobile: boolean): Snowflake[] {
  if (typeof window === 'undefined') return []

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return []

  const flakeCount = mobile
    ? ANIMATION_CONFIG.snowflakesMobile
    : ANIMATION_CONFIG.snowflakesDesktop

  // Generate random snowflakes
  return Array.from({ length: flakeCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 12 + Math.random() * 8,
    size: mobile ? 8 + Math.random() * 6 : 10 + Math.random() * 10,
    opacity: mobile ? 0.4 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3
  }))
}

export const SnowAnimation = () => {
  const mobile = useIsMobile()

  // Regenerate snowflakes when mobile/desktop changes
  const snowflakes = useMemo(() => generateSnowflakes(mobile), [mobile])

  return (
    <div
      className='pointer-events-none fixed inset-0 z-10 overflow-hidden'
      aria-hidden='true'
    >
      {/* Falling Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className='snowflake absolute text-blue-300 dark:text-blue-200'
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity
          }}
        >
          ❄
        </div>
      ))}

      {/* Floating Snowboard */}
      <div className='snowboard-float absolute bottom-8 right-8 text-4xl sm:bottom-12 sm:right-12 sm:text-5xl'>
        🏂
      </div>
    </div>
  )
}
