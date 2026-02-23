import React from 'react'
import { DividerPublic } from './blocks/Divider.public'
import { TextBlockPublic } from './blocks/TextBlock.public'
import { ImageBlockPublic } from './blocks/ImageBlock.public'
import { ButtonBlockPublic } from './blocks/ButtonBlock.public'
import { HeroBlockPublic } from './blocks/HeroBlock.public'
import { IconBoxPublic } from './blocks/IconBox.public'
import { SectionPublic } from './blocks/Section.public'
import { HeadingPublic } from './blocks/Heading.public'
import { SpacerPublic } from './blocks/Spacer.public'
import { AlertPublic } from './blocks/Alert.public'
import { CardPublic } from './blocks/Card.public'
import { TestimonialPublic } from './blocks/Testimonial.public'
import { VideoPublic } from './blocks/Video.public'
import { IconListPublic } from './blocks/IconList.public'
import { NumberHighlightPublic } from './blocks/NumberHighlight.public'
import type {
  CraftState,
  CraftNode,
  DividerProps,
  TextBlockProps,
  ImageBlockProps,
  ButtonBlockProps,
  HeroBlockProps,
  IconBoxProps,
  SectionProps,
  HeadingProps,
  SpacerProps,
  AlertProps,
  CardProps,
  TestimonialProps,
  VideoProps,
  IconListProps,
  NumberHighlightProps,
} from './types'

function renderNodeList(nodeIds: string[], nodes: CraftState): React.ReactNode {
  return (
    <>
      {nodeIds.map((id) => renderNode(id, nodes))}
    </>
  )
}

function renderNode(nodeId: string, nodes: CraftState): React.ReactNode {
  const node: CraftNode | undefined = nodes[nodeId]
  if (!node || node.hidden) return null

  const name = node.type.resolvedName
  const props = node.props

  switch (name) {
    case 'RootContainer': {
      return (
        <div key={nodeId}>
          {renderNodeList(node.nodes, nodes)}
        </div>
      )
    }

    case 'Section': {
      const sectionProps = props as SectionProps
      const columns = sectionProps.columns ?? 1
      // Collect only the visible columns based on columns count
      const colKeys = Object.keys(node.linkedNodes)
        .sort()
        .slice(0, columns)

      const columnContents = colKeys.map((key) => {
        const colNodeId = node.linkedNodes[key]
        const colNode = nodes[colNodeId]
        if (!colNode) return null
        return renderNodeList(colNode.nodes, nodes)
      })

      return (
        <SectionPublic
          key={nodeId}
          {...sectionProps}
          columnContents={columnContents}
        />
      )
    }

    case 'ColumnCanvas': {
      // Rendered inside Section; just render children inline
      return (
        <React.Fragment key={nodeId}>
          {renderNodeList(node.nodes, nodes)}
        </React.Fragment>
      )
    }

    case 'TextBlock':
      return <TextBlockPublic key={nodeId} {...(props as TextBlockProps)} />

    case 'ImageBlock':
      return <ImageBlockPublic key={nodeId} {...(props as ImageBlockProps)} />

    case 'ButtonBlock':
      return <ButtonBlockPublic key={nodeId} {...(props as ButtonBlockProps)} />

    case 'HeroBlock':
      return <HeroBlockPublic key={nodeId} {...(props as HeroBlockProps)} />

    case 'IconBox':
      return <IconBoxPublic key={nodeId} {...(props as IconBoxProps)} />

    case 'Divider':
      return <DividerPublic key={nodeId} {...(props as DividerProps)} />

    case 'Heading':
      return <HeadingPublic key={nodeId} {...(props as HeadingProps)} />

    case 'Spacer':
      return <SpacerPublic key={nodeId} {...(props as SpacerProps)} />

    case 'Alert':
      return <AlertPublic key={nodeId} {...(props as AlertProps)} />

    case 'Card':
      return <CardPublic key={nodeId} {...(props as CardProps)} />

    case 'Testimonial':
      return <TestimonialPublic key={nodeId} {...(props as TestimonialProps)} />

    case 'Video':
      return <VideoPublic key={nodeId} {...(props as VideoProps)} />

    case 'IconList':
      return <IconListPublic key={nodeId} {...(props as IconListProps)} />

    case 'NumberHighlight':
      return <NumberHighlightPublic key={nodeId} {...(props as NumberHighlightProps)} />

    default:
      return null
  }
}

interface PageRendererProps {
  content: string
}

export function PageRenderer({ content }: PageRendererProps) {
  const trimmed = content.trim()
  const isCraftJson = trimmed.startsWith('{') && trimmed.includes('"ROOT"')

  if (!isCraftJson) {
    // Legacy HTML content
    return (
      <div
        className="prose prose-slate max-w-3xl mx-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  try {
    const nodes: CraftState = JSON.parse(content)
    const root = nodes['ROOT']
    if (!root) return null

    // Render ROOT's children (top-level nodes)
    return (
      <div>
        {root.nodes.map((nodeId) => renderNode(nodeId, nodes))}
      </div>
    )
  } catch {
    // Fallback if JSON is malformed
    return (
      <div
        className="prose prose-slate max-w-3xl mx-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }
}
