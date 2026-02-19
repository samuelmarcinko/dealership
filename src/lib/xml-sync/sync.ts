/**
 * XML Sync – core logic
 *
 * Fetches the configured XML feed, parses it, and upserts vehicles into the DB.
 * – Vehicles missing from the feed are marked SOLD (only if they were imported)
 * – Images are additive: new URLs are appended, existing ones are preserved
 * – A simple mutex prevents concurrent syncs
 */

import { prisma } from '@/lib/prisma'
import { parseXmlFeed } from './parser'

export interface SyncResult {
  success: boolean
  count: number
  message: string
  syncedAt: Date
}

// ── Mutex ─────────────────────────────────────────────────────────────────
let syncing = false

// ── Status helpers ────────────────────────────────────────────────────────

async function setSyncStatus(status: string, message: string) {
  await Promise.all([
    prisma.tenantSettings.upsert({
      where: { key: 'last_sync_status' },
      update: { value: status },
      create: { key: 'last_sync_status', value: status },
    }),
    prisma.tenantSettings.upsert({
      where: { key: 'last_sync_message' },
      update: { value: message },
      create: { key: 'last_sync_message', value: message },
    }),
    prisma.tenantSettings.upsert({
      where: { key: 'last_sync_at' },
      update: { value: new Date().toISOString() },
      create: { key: 'last_sync_at', value: new Date().toISOString() },
    }),
  ])
}

async function setSyncCount(count: number) {
  await prisma.tenantSettings.upsert({
    where: { key: 'last_sync_count' },
    update: { value: String(count) },
    create: { key: 'last_sync_count', value: String(count) },
  })
}

// ── Main sync function ────────────────────────────────────────────────────

export async function runXmlSync(): Promise<SyncResult> {
  if (syncing) {
    return {
      success: false,
      count: 0,
      message: 'Sync is already running',
      syncedAt: new Date(),
    }
  }

  syncing = true
  const syncedAt = new Date()

  try {
    // 1. Read feed URL from settings
    const urlSetting = await prisma.tenantSettings.findUnique({ where: { key: 'xml_feed_url' } })
    const feedUrl = urlSetting?.value?.trim()

    if (!feedUrl) {
      await setSyncStatus('idle', 'No XML feed URL configured')
      return { success: false, count: 0, message: 'No XML feed URL configured', syncedAt }
    }

    await setSyncStatus('running', 'Fetching XML feed…')

    // 2. Fetch XML
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(30_000),
      headers: { 'User-Agent': 'AutoBazar-SyncBot/2.0' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xml = await response.text()

    // 3. Parse
    await setSyncStatus('running', 'Parsing vehicles…')
    const parsed = parseXmlFeed(xml)

    if (parsed.length === 0) {
      await setSyncStatus('success', 'Feed returned 0 vehicles')
      return { success: true, count: 0, message: 'Feed returned 0 vehicles', syncedAt }
    }

    // 4. Upsert vehicles
    let count = 0
    const syncedExternalIds: string[] = []

    for (const v of parsed) {
      // Upsert vehicle
      const saved = await prisma.vehicle.upsert({
        where: { externalId: v.externalId },
        update: {
          title: v.title,
          make: v.make,
          model: v.model,
          variant: v.variant ?? null,
          year: v.year,
          price: v.price,
          mileage: v.mileage,
          fuelType: v.fuelType,
          transmission: v.transmission,
          bodyType: v.bodyType ?? null,
          engineCapacity: v.engineCapacity ?? null,
          power: v.power ?? null,
          color: v.color ?? null,
          doors: v.doors ?? null,
          seats: v.seats ?? null,
          description: v.description ?? null,
          features: v.features,
          status: v.status,
          importedAt: syncedAt,
        },
        create: {
          externalId: v.externalId,
          title: v.title,
          make: v.make,
          model: v.model,
          variant: v.variant ?? null,
          year: v.year,
          price: v.price,
          mileage: v.mileage,
          fuelType: v.fuelType,
          transmission: v.transmission,
          bodyType: v.bodyType ?? null,
          engineCapacity: v.engineCapacity ?? null,
          power: v.power ?? null,
          color: v.color ?? null,
          doors: v.doors ?? null,
          seats: v.seats ?? null,
          description: v.description ?? null,
          features: v.features,
          status: v.status,
          importedAt: syncedAt,
        },
      })

      // Sync images (additive – never delete existing)
      if (v.imageUrls.length > 0) {
        const existingImages = await prisma.vehicleImage.findMany({
          where: { vehicleId: saved.id },
          select: { url: true },
        })
        const existingUrls = new Set(existingImages.map((i) => i.url))
        const newUrls = v.imageUrls.filter((url) => !existingUrls.has(url))

        for (let i = 0; i < newUrls.length; i++) {
          await prisma.vehicleImage.create({
            data: {
              vehicleId: saved.id,
              url: newUrls[i],
              isPrimary: existingImages.length === 0 && i === 0,
              sortOrder: existingImages.length + i,
            },
          })
        }
      }

      syncedExternalIds.push(v.externalId)
      count++
    }

    // 5. Mark vanished imported vehicles as SOLD
    if (syncedExternalIds.length > 0) {
      await prisma.vehicle.updateMany({
        where: {
          externalId: { notIn: syncedExternalIds },
          NOT: { externalId: null },
          status: { in: ['AVAILABLE', 'RESERVED'] },
        },
        data: { status: 'SOLD' },
      })
    }

    const message = `Synced ${count} vehicle${count !== 1 ? 's' : ''} from feed`
    await setSyncStatus('success', message)
    await setSyncCount(count)

    console.log(`[XML Sync] ${message}`)
    return { success: true, count, message, syncedAt }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[XML Sync] Error:', message)
    await setSyncStatus('error', message)
    return { success: false, count: 0, message, syncedAt }
  } finally {
    syncing = false
  }
}

export function isSyncing() {
  return syncing
}
