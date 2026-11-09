'use client'

import { useState } from 'react'
import { Printer, FileDown, Loader2 } from 'lucide-react'

interface Props {
  /** Id vygenerovaných dokumentov, ktoré sú na stránke. */
  ids: string[]
}

export default function DocumentActions({ ids }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function downloadDocx() {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch(`/api/documents/generated/docx?ids=${ids.join(',')}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Sťahovanie zlyhalo')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'zmluvy.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Až po kliknutí, inak prehliadač nestihne začať sťahovať
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sťahovanie zlyhalo')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Printer className="h-4 w-4" />
        Tlačiť
      </button>

      <button
        onClick={downloadDocx}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 transition-colors disabled:opacity-60"
      >
        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        Stiahnuť Word
      </button>

      {error && <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>}
    </div>
  )
}
