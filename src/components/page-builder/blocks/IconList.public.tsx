import React from 'react'
import * as Icons from 'lucide-react'
import type { IconListProps } from '../types'

type LucideIconComponent = React.ComponentType<{ className?: string }>

const iconSizeMap: Record<string, string> = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }
const spacingMap: Record<string, string>  = { sm: 'gap-2', md: 'gap-3', lg: 'gap-5' }

export function IconListPublic({
  items = [{ icon: 'Check', text: 'Položka zoznamu' }],
  iconColor = '#f97316',
  iconSize = 'md',
  spacing = 'md',
  dividers = false,
}: IconListProps) {
  return (
    <ul className={`flex flex-col ${spacingMap[spacing] ?? 'gap-3'}`}>
      {items.map((item, i) => {
        const LucideIcon = (Icons as unknown as Record<string, LucideIconComponent>)[item.icon ?? 'Check']
        return (
          <li
            key={i}
            className={`flex items-start gap-3 ${dividers && i > 0 ? 'pt-3 border-t border-slate-200' : ''}`}
          >
            {LucideIcon && (
              <span className="flex-shrink-0 mt-0.5" style={{ color: iconColor }}>
                <LucideIcon className={iconSizeMap[iconSize] ?? 'h-5 w-5'} />
              </span>
            )}
            {item.link ? (
              <a href={item.link} className="text-slate-700 hover:text-orange-500 transition-colors">
                {item.text}
              </a>
            ) : (
              <span className="text-slate-700">{item.text}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
