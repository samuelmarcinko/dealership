'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeCtx)
}

export default function ThemeProvider({
  defaultTheme,
  children,
}: {
  defaultTheme: Theme
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // On mount: check localStorage, fall back to server default
  useEffect(() => {
    const stored = localStorage.getItem('public-theme') as Theme | null
    const resolved: Theme = stored === 'light' || stored === 'dark' ? stored : defaultTheme
    setTheme(resolved)
    setMounted(true)
  }, [defaultTheme])

  // Apply/remove class on <html> whenever theme changes
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark-public')
    } else {
      root.classList.remove('dark-public')
    }
    localStorage.setItem('public-theme', theme)
  }, [theme, mounted])

  // Cleanup: remove class when leaving public layout (navigating to admin)
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark-public')
    }
  }, [])

  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeCtx.Provider>
  )
}
