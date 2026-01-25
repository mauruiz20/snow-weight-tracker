import { useEffect, useState } from 'react'
import { BREAKPOINTS } from '@/lib/constants'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop' // SSR default

  const width = window.innerWidth
  if (width < BREAKPOINTS.mobile) return 'mobile'
  if (width < BREAKPOINTS.tablet) return 'tablet'
  return 'desktop'
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint)

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint())
    }

    // Set initial value on mount (handles SSR hydration)
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  }
}

// Convenience hook for just mobile check
export function useIsMobile() {
  const { isMobile } = useBreakpoint()
  return isMobile
}
