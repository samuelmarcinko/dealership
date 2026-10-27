import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DocumentTemplateEditor, { type TemplateFormValue } from '@/components/admin/DocumentTemplateEditor'
import { parseCustomFields } from '@/lib/documents/schema'

export const metadata: Metadata = { title: 'Šablóna zmluvy' }

const EMPTY: TemplateFormValue = {
  id: null,
  name: '',
  description: '',
  content: '',
  context: 'SALE',
  customerType: null,
  customFields: [],
  isActive: true,
}

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === 'new') return <DocumentTemplateEditor initial={EMPTY} />

  const template = await prisma.documentTemplate.findUnique({ where: { id } })
  if (!template) notFound()

  return (
    <DocumentTemplateEditor
      initial={{
        id: template.id,
        name: template.name,
        description: template.description ?? '',
        content: template.content,
        context: template.context,
        customerType: template.customerType,
        customFields: parseCustomFields(template.customFields),
        isActive: template.isActive,
      }}
    />
  )
}
