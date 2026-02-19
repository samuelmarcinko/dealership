/**
 * Sync Cron Scheduler
 *
 * Runs a check every minute.
 * Decides whether to trigger a full sync based on:
 *   – configured sync_interval_minutes (from TenantSettings)
 *   – time elapsed since last_sync_at
 *
 * This approach makes the interval truly dynamic:
 * changing the setting in the admin panel takes effect within 1 minute.
 */

import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { runXmlSync } from './sync'

let started = false

export function startSyncCron() {
  if (started) return
  started = true

  console.log('[Sync Cron] Starting scheduler (check every 1 min)')

  // Run immediately on start (after a short delay for DB readiness)
  setTimeout(() => tick(), 15_000)

  // Then check every minute
  cron.schedule('* * * * *', () => tick(), { timezone: 'Europe/Bratislava' })
}

async function tick() {
  try {
    const settings = await prisma.tenantSettings.findMany({
      where: { key: { in: ['xml_feed_url', 'sync_interval_minutes', 'last_sync_at'] } },
    })

    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))

    const feedUrl = map['xml_feed_url']?.trim()
    if (!feedUrl) return // nothing configured

    const intervalMinutes = parseInt(map['sync_interval_minutes'] ?? '30')
    const lastSyncAt = map['last_sync_at'] ? new Date(map['last_sync_at']) : null

    const now = Date.now()
    const elapsed = lastSyncAt ? now - lastSyncAt.getTime() : Infinity

    if (elapsed >= intervalMinutes * 60 * 1_000) {
      console.log(`[Sync Cron] Triggering sync (interval: ${intervalMinutes}m, elapsed: ${Math.round(elapsed / 60_000)}m)`)
      await runXmlSync()
    }
  } catch (err) {
    console.error('[Sync Cron] Tick error:', err)
  }
}
