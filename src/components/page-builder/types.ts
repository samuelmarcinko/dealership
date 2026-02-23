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

// ---- New block types ----

export interface HeadingProps {
  text?: string
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  fontSize?: 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl'
  fontWeight?: 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold' | 'font-extrabold'
  align?: 'left' | 'center' | 'right'
  color?: string
  italic?: boolean
  uppercase?: boolean
  paddingTop?: number
  paddingBottom?: number
}

export interface SpacerProps {
  height?: number
}

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  showIcon?: boolean
}

export interface CardProps {
  mode?: 'icon' | 'image'
  icon?: string
  imageUrl?: string
  title?: string
  text?: string
  align?: 'left' | 'center'
  showButton?: boolean
  buttonText?: string
  buttonHref?: string
  buttonVariant?: 'primary' | 'outline'
  bgColor?: string
  borderColor?: string
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  borderRadius?: 'none' | 'md' | 'lg' | 'xl' | '2xl'
  padding?: 'sm' | 'md' | 'lg'
}

export interface TestimonialProps {
  quote?: string
  authorName?: string
  authorTitle?: string
  authorImage?: string
  rating?: number
  style?: 'card' | 'minimal' | 'quote'
  bgColor?: string
  textColor?: string
}

export interface VideoProps {
  url?: string
  aspectRatio?: '16/9' | '4/3' | '1/1'
  caption?: string
  showCaption?: boolean
}

export interface IconListItem {
  icon: string
  text: string
  link?: string
}

export interface IconListProps {
  items?: IconListItem[]
  iconColor?: string
  iconSize?: 'sm' | 'md' | 'lg'
  spacing?: 'sm' | 'md' | 'lg'
  dividers?: boolean
}

export interface NumberHighlightProps {
  number?: string
  label?: string
  prefix?: string
  suffix?: string
  color?: string
  align?: 'left' | 'center' | 'right'
  numberSize?: 'text-4xl' | 'text-5xl' | 'text-6xl'
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
