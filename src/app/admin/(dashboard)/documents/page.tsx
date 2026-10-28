import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DocumentTemplatesManager from '@/components/admin/DocumentTemplatesManager'

export const metadata: Metadata = { title: 'Šablóny zmlúv' }

export default async function DocumentsPage() {
  const templates = await prisma.documentTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      sortOrder: true,
    },
  })

  return <DocumentTemplatesManager initialTemplates={templates} />
}
