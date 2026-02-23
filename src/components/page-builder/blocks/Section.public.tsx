import React from 'react'
import type { SectionProps } from '../types'

const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

const gapClasses: Record<string, string> = { sm: 'gap-4', md: 'gap-8', lg: 'gap-12' }

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
}

interface SectionPublicProps extends SectionProps {
  columnContents: React.ReactNode[]
}

export function SectionPublic({
  columns = 1,
  gap = 'md',
  bgColor = '',
  padding = 'md',
  columnContents,
}: SectionPublicProps) {
  return (
    <section
      className={paddingClasses[padding] ?? 'py-16'}
      style={bgColor ? { backgroundColor: bgColor } : {}}
    >
      <div className="container mx-auto px-4">
        <div className={`grid ${colClasses[columns] ?? 'grid-cols-1'} ${gapClasses[gap] ?? 'gap-8'}`}>
          {columnContents.map((col, i) => (
            <div key={i}>{col}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
