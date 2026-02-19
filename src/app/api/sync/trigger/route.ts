import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { runXmlSync, isSyncing } from '@/lib/xml-sync/sync'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (isSyncing()) {
    return NextResponse.json({ error: 'Sync is already running', running: true }, { status: 409 })
  }

  // Fire-and-forget: return immediately so the UI gets a fast response
  // The sync runs in the background and updates TenantSettings
  runXmlSync().catch((err) => console.error('[Sync Trigger] Error:', err))

  return NextResponse.json({ success: true, message: 'Sync started' })
}
