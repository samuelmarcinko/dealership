/**
 * XML Sync – core logic
 *
 * Fetches the configured XML feed, parses it, and upserts vehicles into the DB.
 * – Vehicles missing from the feed are marked SOLD (only if they were imported)
 * – Images are fully replaced on each sync for imported vehicles (CDN signed URLs change)
 * – A simple mutex prevents concurrent syncs
 */

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseXmlFeed } from './parser'
import { generateVehicleSlug } from '@/lib/slug'

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
      const sharedData = {
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
        vin: v.vin ?? null,
        driveType: v.driveType ?? null,
        emissionStandard: v.emissionStandard ?? null,
        externalUrl: v.externalUrl ?? null,
        description: v.description ?? null,
        features: v.features,
        extraParams: v.extraParams ? (v.extraParams as Prisma.InputJsonValue) : Prisma.JsonNull,
        status: v.status,
        importedAt: syncedAt,
      }

      // Generate slug only on create (not on update — slug stays stable)
      const existing = await prisma.vehicle.findUnique({
        where: { externalId: v.externalId },
        select: { id: true, slug: true },
      })

      let saved: { id: string }
      if (existing) {
        saved = await prisma.vehicle.update({
          where: { externalId: v.externalId },
          data: sharedData,
          select: { id: true },
        })
      } else {
        const slug = await generateVehicleSlug(v.title)
        saved = await prisma.vehicle.create({
          data: { ...sharedData, externalId: v.externalId, slug },
          select: { id: true },
        })
      }

      // Sync images: fully replace on each sync
      // (CDN signed URLs change on each feed fetch — compare by path only)
      if (v.imageUrls.length > 0) {
        const existingImages = await prisma.vehicleImage.findMany({
          where: { vehicleId: saved.id },
          select: { id: true, url: true },
        })

        // Compare by path (without query string) to avoid churning on token changes
        const stripQuery = (url: string) => url.split('?')[0]
        const existingPaths = new Map(existingImages.map(i => [stripQuery(i.url), i.id]))
        const newPaths = new Set(v.imageUrls.map(stripQuery))

        // Delete images no longer in feed
        const toDelete = existingImages
          .filter(i => !newPaths.has(stripQuery(i.url)))
          .map(i => i.id)
        if (toDelete.length > 0) {
          await prisma.vehicleImage.deleteMany({ where: { id: { in: toDelete } } })
        }

        // Update URL (token refresh) for existing images still in feed
        for (const newUrl of v.imageUrls) {
          const path = stripQuery(newUrl)
          const existingId = existingPaths.get(path)
          if (existingId) {
            await prisma.vehicleImage.update({
              where: { id: existingId },
              data: { url: newUrl },
            })
          }
        }

        // Add new images not yet in DB
        const newUrls = v.imageUrls.filter(url => !existingPaths.has(stripQuery(url)))
        const currentCount = existingImages.length - toDelete.length
        for (let i = 0; i < newUrls.length; i++) {
          await prisma.vehicleImage.create({
            data: {
              vehicleId: saved.id,
              url: newUrls[i],
              isPrimary: currentCount === 0 && i === 0,
              sortOrder: currentCount + i,
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
