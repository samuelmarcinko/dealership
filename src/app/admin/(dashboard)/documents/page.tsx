import React from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DocumentTemplatesManager from '@/components/admin/DocumentTemplatesManager'

export const metadata: Metadata = { title: 'Šablóny dokumentov' }

export default async function DocumentsPage() {
  const templates = await prisma.documentTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  return <DocumentTemplatesManager initialTemplates={templates} />
}
