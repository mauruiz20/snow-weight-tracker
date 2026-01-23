'use client'

import { useState } from 'react'

interface Snowflake {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
}

const generateSnowflakes = (): Snowflake[] => {
  // Detect if mobile device (screen width < 768px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Reduce snowflakes on mobile for better performance
  // Desktop: 35 snowflakes, Mobile: 12 snowflakes
  const flakeCount = isMobile ? 12 : 35

  // Generate random snowflakes
  return Array.from({ length: flakeCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 10,
    size: isMobile ? 6 + Math.random() * 8 : 8 + Math.random() * 12, // Smaller on mobile
    opacity: isMobile ? 0.3 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4 // Lower opacity on mobile
  }))
}

export const SnowAnimation = () => {
  // Use lazy initializer to generate snowflakes only once on mount
  const [snowflakes] = useState<Snowflake[]>(generateSnowflakes)

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
