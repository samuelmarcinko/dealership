'use client'

import { useEffect, useRef, useState } from 'react'

type From = 'bottom' | 'left' | 'right' | 'scale' | 'fade'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  from?: From
  duration?: number
}

const INITIAL_TRANSFORMS: Record<From, string> = {
  bottom: 'translateY(32px)',
  left: 'translateX(-32px)',
  right: 'translateX(32px)',
  scale: 'scale(0.92)',
  fade: 'none',
}

export default function AnimateIn({
  children,
  className,
  delay = 0,
  from = 'bottom',
  duration = 600,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : INITIAL_TRANSFORMS[from],
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
