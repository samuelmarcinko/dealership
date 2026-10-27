import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PrintButton from '@/components/admin/PrintButton'

export const metadata = { title: 'Tlač dokumentov' }

export default async function PrintDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const idList = (ids ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (idList.length === 0) notFound()

  const docs = await prisma.generatedDocument.findMany({
    where: { id: { in: idList } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  if (docs.length === 0) notFound()

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #e2e8f0; }
        .sheet {
          width: 210mm;
          min-height: 297mm;
          margin: 8mm auto;
          background: #fff;
          box-shadow: 0 1px 6px rgba(0,0,0,.18);
          break-after: page;
        }
        .sheet:last-child { break-after: auto; }
        .toolbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; justify-content: center; gap: .75rem;
          padding: .75rem; background: #fff;
          border-bottom: 1px solid #cbd5e1;
        }
        @media print {
          html, body { background: #fff; }
          .no-print { display: none !important; }
          .sheet { margin: 0; box-shadow: none; min-height: auto; }
        }
      `}</style>

      <div className="toolbar no-print">
        <PrintButton />
        <span style={{ alignSelf: 'center', fontSize: '13px', color: '#64748b' }}>
          {docs.length === 1 ? '1 dokument' : `${docs.length} dokumenty`} · v dialógu tlače zvoľte „Uložiť ako PDF“
        </span>
      </div>

      {docs.map((doc) => (
        <div key={doc.id} className="sheet">
          <div
            className="contract-output"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
      ))}
    </>
  )
}
