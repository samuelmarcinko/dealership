import React from 'react'
import type { SpacerProps } from '../types'

export function SpacerPublic({ height = 40 }: SpacerProps) {
  return <div style={{ height: `${height}px` }} aria-hidden="true" />
}
