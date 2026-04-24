'use client'

import React, { useRef, useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { Trash2, Copy, ImageIcon, Upload, Loader2 } from 'lucide-react'

export type LibraryFile = {
  id: string
  url: string
  filename: string
  size?: number
  folder: 'media' | 'vehicles' | 'branding'
  label?: string
}

interface Props {
  initialFiles: LibraryFile[]
}

const FOLDER_TABS = [
  { key: 'all', label: 'Všetko' },
  { key: 'vehicles', label: 'Vozidlá' },
  { key: 'branding', label: 'Branding' },
  { key: 'media', label: 'Médiá' },
] as const

type TabKey = 'all' | 'media' | 'vehicles' | 'branding'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaLibrary({ initialFiles }: Props) {
  const { toast } = useToast()
  const [files, setFiles] = useState<LibraryFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = activeTab === 'all' ? files : files.filter((f) => f.folder === activeTab)

  const counts: Record<TabKey, number> = {
    all: files.length,
    vehicles: files.filter((f) => f.folder === 'vehicles').length,
    branding: files.filter((f) => f.folder === 'branding').length,
    media: files.filter((f) => f.folder === 'media').length,
  }

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
      setFiles((prev) => [{ ...json.data, folder: 'media' as const }, ...prev])
      toast('success', 'Obrázok nahraný')
    } catch {
      toast('error', 'Nastala chyba pri nahrávaní')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(file: LibraryFile) {
    if (!window.confirm(`Zmazať "${file.filename}"?`)) return
    try {
      const res = await fetch('/api/media/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: file.folder, id: file.id }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast('error', json.error ?? 'Chyba mazania')
        return
      }
      setFiles((prev) => prev.filter((f) => !(f.id === file.id && f.folder === file.folder)))
      toast('success', 'Súbor zmazaný')
    } catch {
      toast('error', 'Nastala chyba')
    }
  }

  async function handleCopy(url: string) {
    const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url
    await navigator.clipboard.writeText(fullUrl)
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
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {FOLDER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-slate-400">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <ImageIcon className="h-12 w-12 text-slate-300" />
          <p className="text-sm">Žiadne súbory v tejto kategórii.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((file) => (
            <div key={`${file.folder}-${file.id}`} className="group relative">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
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
                {file.label && (
                  <p className="text-xs text-slate-500 truncate" title={file.label}>
                    {file.label}
                  </p>
                )}
                <p className="text-xs text-slate-700 truncate" title={file.filename}>
                  {file.filename}
                </p>
                {file.size !== undefined && (
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
