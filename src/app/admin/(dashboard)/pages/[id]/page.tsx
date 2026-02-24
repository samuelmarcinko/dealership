import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PageForm from '@/components/admin/PageForm'

export const metadata: Metadata = { title: 'Upraviť stránku' }

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await prisma.customPage.findUnique({ where: { id } })
  if (!page) notFound()

  return (
    // -m-6 cancels the p-6 from layout, h-full fills the flex-1 main area
    <div className="h-full flex flex-col -m-6">
      <PageForm
        initialData={{
          id: page.id,
          slug: page.slug,
          title: page.title,
          content: page.content,
          isPublished: page.isPublished,
          showInNav: page.showInNav,
          navOrder: page.navOrder,
          seoTitle: page.seoTitle ?? undefined,
          seoDescription: page.seoDescription ?? undefined,
          ogImage: page.ogImage ?? undefined,
        }}
      />
    </div>
  )
}
