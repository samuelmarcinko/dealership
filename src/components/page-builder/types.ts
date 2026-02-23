// Craft.js serialized node structure
export interface CraftNode {
  type: { resolvedName: string }
  isCanvas: boolean
  props: Record<string, unknown>
  displayName: string
  custom: Record<string, unknown>
  parent: string | null
  hidden: boolean
  nodes: string[]
  linkedNodes: Record<string, string>
}

export type CraftState = Record<string, CraftNode>

// Block prop interfaces
export interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg'
  color?: string
}

export interface TextBlockProps {
  content?: string
}

export interface ImageBlockProps {
  src?: string
  alt?: string
  objectFit?: 'cover' | 'contain'
  height?: number
}

export interface ButtonBlockProps {
  text?: string
  href?: string
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'center' | 'right'
}

export interface HeroBlockProps {
  title?: string
  subtitle?: string
  bgColor?: string
  bgImage?: string
  ctaText?: string
  ctaHref?: string
  textColor?: string
}

export interface IconBoxProps {
  icon?: string
  title?: string
  description?: string
  align?: 'left' | 'center'
}

export interface SectionProps {
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  bgColor?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface PageData {
  id?: string
  slug: string
  title: string
  content: string
  isPublished: boolean
  showInNav: boolean
  navOrder: number
}

export function isCraftJson(content: string): boolean {
  const trimmed = content.trim()
  return trimmed.startsWith('{') && trimmed.includes('"ROOT"')
}

export function generateMigrationJson(htmlContent: string): string {
  const nodeId = 'node-' + Math.random().toString(36).substr(2, 9)
  return JSON.stringify({
    ROOT: {
      type: { resolvedName: 'RootContainer' },
      isCanvas: true,
      props: {},
      displayName: 'Root',
      custom: {},
      parent: null,
      hidden: false,
      nodes: [nodeId],
      linkedNodes: {},
    },
    [nodeId]: {
      type: { resolvedName: 'TextBlock' },
      isCanvas: false,
      props: { content: htmlContent },
      displayName: 'Text',
      custom: {},
      parent: 'ROOT',
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  })
}
