'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface LoadingContextType {
  isInitialLoad: boolean
  setInitialLoadComplete: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const setInitialLoadComplete = () => {
    setIsInitialLoad(false)
  }

  return (
    <LoadingContext.Provider value={{ isInitialLoad, setInitialLoadComplete }}>
      {children}
    </LoadingContext.Provider>
  )
}
