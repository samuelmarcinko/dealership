import React from 'react'
import * as Icons from 'lucide-react'
import type { CardProps } from '../types'

type LucideIconComponent = React.ComponentType<{ className?: string }>

const shadowMap: Record<string, string> = {
  none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg',
}
const radiusMap: Record<string, string> = {
  none: '', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl',
}
const paddingMap: Record<string, string> = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function CardPublic({
  mode = 'icon',
  icon = 'Star',
  imageUrl = '',
  title = 'Nadpis karty',
  text = '',
  align = 'center',
  showButton = false,
  buttonText = 'Zistiť viac',
  buttonHref = '#',
  buttonVariant = 'primary',
  bgColor = '',
  borderColor = '',
  shadow = 'md',
  borderRadius = 'lg',
  padding = 'md',
}: CardProps) {
  const LucideIcon = (Icons as unknown as Record<string, LucideIconComponent>)[icon ?? 'Star']
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div
      className={`flex flex-col ${alignCls} ${paddingMap[padding] ?? 'p-6'} ${shadowMap[shadow] ?? 'shadow-md'} ${radiusMap[borderRadius] ?? 'rounded-lg'} border`}
      style={{
        backgroundColor: bgColor || undefined,
        borderColor: borderColor || undefined,
      }}
    >
      {mode === 'image' && imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded-md mb-4" />
      ) : (
        LucideIcon && <LucideIcon className="h-10 w-10 text-orange-500 mb-3" />
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {text && <p className="text-slate-600 text-sm leading-relaxed mb-4">{text}</p>}
      {showButton && (
        <a
          href={buttonHref}
          className={`inline-block px-5 py-2 rounded-md text-sm font-medium transition-colors mt-auto ${
            buttonVariant === 'primary'
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
          }`}
        >
          {buttonText}
        </a>
      )}
    </div>
  )
}
