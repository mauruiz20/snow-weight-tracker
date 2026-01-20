'use client'

import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
}

export const SnowAnimation = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    // Generate random snowflakes on mount
    const flakes: Snowflake[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 10,
      size: 8 + Math.random() * 12,
      opacity: 0.5 + Math.random() * 0.4,
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {/* Falling Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake absolute text-blue-300 dark:text-blue-200"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}

      {/* Floating Snowboard */}
      <div className="snowboard-float absolute bottom-8 right-8 text-4xl sm:bottom-12 sm:right-12 sm:text-5xl">
        🏂
      </div>
    </div>
  )
}
