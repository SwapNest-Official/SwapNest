import React, { createContext, useContext, useState, useEffect } from 'react'
import { subscribeToOffersCount } from '../utils/offersCounter'

const OffersCountContext = createContext()

export const useOffersCount = () => {
  const context = useContext(OffersCountContext)
  if (!context) {
    throw new Error('useOffersCount must be used within an OffersCountProvider')
  }
  return context
}

export const OffersCountProvider = ({ children }) => {
  const [offersCount, setOffersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToOffersCount((count) => {
      setOffersCount(count)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    offersCount,
    loading,
    setOffersCount
  }

  return (
    <OffersCountContext.Provider value={value}>
      {children}
    </OffersCountContext.Provider>
  )
}
