'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, ImageIcon, Upload, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface MediaFile {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: string | Date
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPickerModal({ open, onClose, onSelect }: Props) {
  const { toast } = useToast()
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setTab('library')
    setLoading(true)
    fetch('/api/media')
      .then((r) => r.json())
      .then((json) => setFiles(json.data ?? []))
      .catch(() => toast('error', 'Chyba načítania knižnice'))
      .finally(() => setLoading(false))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) {
        toast('error', json.error ?? 'Chyba nahrávania')
        return
      }
      onSelect(json.data.url)
      onClose()
    } catch {
      toast('error', 'Nastala chyba pri nahrávaní')
    } finally {
      setUploading(false)
      if (uploadRef.current) uploadRef.current.value = ''
    }
  }

  function handleSelect(url: string) {
    onSelect(url)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 flex-shrink-0">
          <DialogTitle>Vybrať obrázok</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 flex-shrink-0">
          <button
            type="button"
            onClick={() => setTab('library')}
            className={`py-2.5 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
              tab === 'library'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Knižnica
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`py-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
              tab === 'upload'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Nahrať
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'library' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                  <p className="text-sm">Knižnica je prázdna. Nahrajte prvý obrázok.</p>
                  <button
                    type="button"
                    onClick={() => setTab('upload')}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    Nahrať obrázok
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {files.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleSelect(file.url)}
                      className="group relative text-left focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-orange-400 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-orange-500 drop-shadow" />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 truncate px-0.5" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-xs text-slate-400 px-0.5">{formatBytes(file.size)}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <label className="flex flex-col items-center gap-4 cursor-pointer w-full max-w-sm border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-xl p-10 transition-colors">
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                ) : (
                  <Upload className="h-10 w-10 text-slate-400" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {uploading ? 'Nahrávam…' : 'Kliknite pre výber súboru'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP alebo SVG — max 10 MB</p>
                </div>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
