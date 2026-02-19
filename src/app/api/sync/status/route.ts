import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSyncing } from '@/lib/xml-sync/sync'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = ['last_sync_at', 'last_sync_status', 'last_sync_message', 'last_sync_count']
  const settings = await prisma.tenantSettings.findMany({ where: { key: { in: keys } } })
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return NextResponse.json({
    data: {
      lastSyncAt: map['last_sync_at'] ?? null,
      status: isSyncing() ? 'running' : (map['last_sync_status'] ?? 'idle'),
      message: map['last_sync_message'] ?? '',
      count: parseInt(map['last_sync_count'] ?? '0'),
      running: isSyncing(),
    },
  })
}
