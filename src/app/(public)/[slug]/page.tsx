import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.customPage.findUnique({
    where: { slug, isPublished: true },
    select: { title: true },
  })
  if (!page) return {}
  return { title: page.title }
}

export default async function CustomPageView({ params }: Props) {
  const { slug } = await params
  const page = await prisma.customPage.findUnique({
    where: { slug, isPublished: true },
  })

  if (!page) notFound()

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">{page.title}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            className="prose prose-slate max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </section>
    </div>
  )
}
