import React from 'react'
import * as Icons from 'lucide-react'
import type { IconBoxProps } from '../types'

type LucideIconComponent = React.ComponentType<{ className?: string }>

export function IconBoxPublic({
  icon = 'Star',
  title = 'Názov',
  description = '',
  align = 'center',
}: IconBoxProps) {
  const LucideIcon = (Icons as unknown as Record<string, LucideIconComponent>)[icon ?? 'Star']

  return (
    <div
      className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start'} gap-3 p-6`}
    >
      {LucideIcon && <LucideIcon className="h-10 w-10 text-orange-500" />}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
    </div>
  )
}
