'use client'

import { useEffect } from 'react'

interface Props {
  id: string
}

export default function VehicleViewTracker({ id }: Props) {
  useEffect(() => {
    fetch(`/api/vehicles/${id}/view`, { method: 'POST' }).catch(() => {
      // Silently ignore errors — tracking is best-effort
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
