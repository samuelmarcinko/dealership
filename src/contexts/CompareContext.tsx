'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const MAX_COMPARE = 3
const STORAGE_KEY = 'dealership_compare'

export interface CompareVehicle {
  id: string
  title: string
  slug: string | null
  imageUrl: string | null
}

interface CompareCtx {
  vehicles: CompareVehicle[]
  toggle: (vehicle: CompareVehicle) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
  isFull: boolean
  count: number
}

const CompareContext = createContext<CompareCtx>({
  vehicles: [],
  toggle: () => {},
  remove: () => {},
  has: () => false,
  clear: () => {},
  isFull: false,
  count: 0,
})

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<CompareVehicle[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setVehicles(JSON.parse(raw) as CompareVehicle[])
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles))
  }, [vehicles, ready])

  const toggle = useCallback((vehicle: CompareVehicle) => {
    setVehicles(prev => {
      if (prev.find(v => v.id === vehicle.id)) return prev.filter(v => v.id !== vehicle.id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, vehicle]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
  }, [])

  const has = useCallback((id: string) => vehicles.some(v => v.id === id), [vehicles])
  const clear = useCallback(() => setVehicles([]), [])

  return (
    <CompareContext.Provider value={{
      vehicles,
      toggle,
      remove,
      has,
      clear,
      isFull: vehicles.length >= MAX_COMPARE,
      count: vehicles.length,
    }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => useContext(CompareContext)
