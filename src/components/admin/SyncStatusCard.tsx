'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, Clock, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'

interface SyncStatus {
  lastSyncAt: string | null
  status: 'idle' | 'running' | 'success' | 'error'
  message: string
  count: number
  running: boolean
}

export default function SyncStatusCard() {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [isPending, startTransition] = useTransition()

  async function fetchStatus() {
    const res = await fetch('/api/sync/status')
    if (res.ok) {
      const json = await res.json()
      setStatus(json.data)
    }
  }

  async function triggerSync() {
    const res = await fetch('/api/sync/trigger', { method: 'POST' })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? 'Nastala chyba')
      return
    }
    // Poll for status updates while running
    await fetchStatus()
  }

  // Auto-refresh every 5 seconds when running
  useEffect(() => {
    fetchStatus()
    const id = setInterval(() => {
      fetchStatus()
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const statusIcon = {
    idle: <Clock className="h-4 w-4 text-slate-400" />,
    running: <Activity className="h-4 w-4 text-blue-500 animate-pulse" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  }

  const statusBadge = {
    idle: <Badge variant="outline">Nečinný</Badge>,
    running: <Badge variant="secondary" className="bg-blue-100 text-blue-800">Prebieha…</Badge>,
    success: <Badge variant="success">Úspech</Badge>,
    error: <Badge variant="error">Chyba</Badge>,
  }

  return (
    <div className="space-y-4">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status ? statusIcon[status.status] : <Clock className="h-4 w-4 text-slate-400" />}
          <span className="text-sm font-medium text-slate-700">Stav posledného syncu</span>
        </div>
        {status ? statusBadge[status.status] : <Badge variant="outline">–</Badge>}
      </div>

      {/* Details */}
      {status && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
          {status.lastSyncAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Posledný sync:</span>
              <span className="font-medium text-slate-900">
                {format(new Date(status.lastSyncAt), 'dd.MM.yyyy HH:mm:ss', { locale: sk })}
              </span>
            </div>
          )}
          {status.count > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Importovaných vozidiel:</span>
              <span className="font-medium text-slate-900">{status.count}</span>
            </div>
          )}
          {status.message && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">Správa:</span>
              <span className={`font-medium text-right ${status.status === 'error' ? 'text-red-600' : 'text-slate-900'}`}>
                {status.message}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Manual trigger */}
      <Button
        onClick={() => startTransition(() => { triggerSync() })}
        disabled={isPending || status?.running}
        variant="outline"
        className="w-full"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${status?.running ? 'animate-spin' : ''}`} />
        {status?.running ? 'Prebieha sync…' : 'Spustiť sync manuálne'}
      </Button>
    </div>
  )
}
