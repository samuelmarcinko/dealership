'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ navStyle }: { navStyle?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const btnClass = cn(
    'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
    navStyle === 'light'
      ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      : 'text-slate-400 hover:text-white hover:bg-white/10'
  )

  return (
    <button
      type="button"
      onClick={toggle}
      className={btnClass}
      aria-label={isDark ? 'Prepnúť na svetlý režim' : 'Prepnúť na tmavý režim'}
      title={isDark ? 'Svetlý režim' : 'Tmavý režim'}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}
      >
        <Moon className="h-4 w-4" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)' }}
      >
        <Sun className="h-4 w-4" />
      </span>
    </button>
  )
}
