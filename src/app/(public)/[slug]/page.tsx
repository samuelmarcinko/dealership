import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PageRenderer } from '@/components/page-builder/Renderer'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.customPage.findUnique({
    where: { slug, isPublished: true },
    select: { title: true, seoTitle: true, seoDescription: true, ogImage: true },
  })
  if (!page) return {}

  const metaTitle = page.seoTitle || page.title
  const metaDescription = page.seoDescription ?? undefined
  const ogImageUrl = page.ogImage ?? undefined

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

export default async function CustomPageView({ params }: Props) {
  const { slug } = await params
  const page = await prisma.customPage.findUnique({
    where: { slug, isPublished: true },
  })

  if (!page) notFound()

  const isCraftJson =
    page.content.trim().startsWith('{') && page.content.includes('"ROOT"')

  return (
    <div className="bg-white">
      {/* Show title header only for legacy HTML pages (Craft.js pages include their own Hero if needed) */}
      {!isCraftJson && (
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold">{page.title}</h1>
          </div>
        </section>
      )}

      {/* Content */}
      {isCraftJson ? (
        <PageRenderer content={page.content} />
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <PageRenderer content={page.content} />
          </div>
        </section>
      )}
    </div>
  )
}
