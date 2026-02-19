import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PageForm from '@/components/admin/PageForm'

export const metadata: Metadata = { title: 'Upraviť stránku' }

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await prisma.customPage.findUnique({ where: { id } })
  if (!page) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Späť na stránky
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Upraviť stránku</h1>
        <p className="text-slate-500 text-sm mt-1">/{page.slug}</p>
      </div>

      <PageForm
        initialData={{
          id: page.id,
          slug: page.slug,
          title: page.title,
          content: page.content,
          isPublished: page.isPublished,
          showInNav: page.showInNav,
          navOrder: page.navOrder,
        }}
      />
    </div>
  )
}
