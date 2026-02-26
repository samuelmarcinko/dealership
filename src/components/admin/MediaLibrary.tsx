'use client'

import React, { useRef, useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { Trash2, Copy, ImageIcon, Upload, Loader2 } from 'lucide-react'

interface MediaFile {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: string | Date
}

interface Props {
  initialFiles: MediaFile[]
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaLibrary({ initialFiles }: Props) {
  const { toast } = useToast()
  const [files, setFiles] = useState<MediaFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
      setFiles((prev) => [json.data, ...prev])
      toast('success', 'Obrázok nahraný')
    } catch {
      toast('error', 'Nastala chyba pri nahrávaní')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(file: MediaFile) {
    if (!window.confirm(`Zmazať "${file.filename}"?`)) return
    try {
      const res = await fetch(`/api/media/${file.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Chyba mazania')
        return
      }
      setFiles((prev) => prev.filter((f) => f.id !== file.id))
      toast('success', 'Súbor zmazaný')
    } catch {
      toast('error', 'Nastala chyba')
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    toast('success', 'URL skopírovaná')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knižnica médií</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {files.length} {files.length === 1 ? 'súbor' : files.length < 5 ? 'súbory' : 'súborov'}
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? 'Nahrávam…' : 'Nahrať obrázok'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <ImageIcon className="h-12 w-12 text-slate-300" />
          <p className="text-sm">Žiadne médiá. Nahrajte prvý obrázok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map((file) => (
            <div key={file.id} className="group relative">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(file.url)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    title="Kopírovať URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file)}
                    className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    title="Zmazať"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-1 px-0.5">
                <p className="text-xs text-slate-700 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
