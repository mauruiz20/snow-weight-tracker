import { useCallback, useRef, useState } from 'react'

interface UseSwipeNavigationProps {
  totalItems: number
}

export function useSwipeNavigation({ totalItems }: UseSwipeNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return

      const touchEndX = e.changedTouches[0].clientX
      const diff = touchStartX.current - touchEndX
      const threshold = 50

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left -> next
          setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1))
        } else {
          // Swipe right -> previous
          setCurrentIndex((prev) => Math.max(prev - 1, 0))
        }
      }

      touchStartX.current = null
    },
    [totalItems]
  )

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1))
  }, [totalItems])

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Ensure index is valid
  const validIndex = Math.min(Math.max(0, currentIndex), Math.max(0, totalItems - 1))

  return {
    currentIndex: validIndex,
    handleTouchStart,
    handleTouchEnd,
    goToPrev,
    goToNext,
    goToIndex,
    isFirst: validIndex === 0,
    isLast: validIndex === totalItems - 1
  }
}
