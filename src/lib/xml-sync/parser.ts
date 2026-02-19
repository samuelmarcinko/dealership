/**
 * XML Feed Parser for automotive imports
 *
 * Supports common Slovak / Czech automotive XML formats:
 *   – autobazar.eu  <offers><offer id="…">…</offer></offers>
 *   – ojazdené.sk   <cars><car>…</car></cars>
 *   – Generic       <inzeraty><inzerat>…</inzerat></inzeraty>
 */

import { XMLParser } from 'fast-xml-parser'
import type { FuelType, TransmissionType, BodyType, VehicleStatus } from '@prisma/client'

export interface ParsedVehicle {
  externalId: string
  title: string
  make: string
  model: string
  variant?: string
  year: number
  price: number
  mileage: number
  fuelType: FuelType
  transmission: TransmissionType
  bodyType?: BodyType
  engineCapacity?: number
  power?: number
  color?: string
  doors?: number
  seats?: number
  description?: string
  features: string[]
  imageUrls: string[]
  status: VehicleStatus
}

// ─── Field normalisation maps ──────────────────────────────────────────────

const FUEL_MAP: Record<string, FuelType> = {
  nafta: 'DIESEL', diesel: 'DIESEL',
  benzin: 'PETROL', benzín: 'PETROL', petrol: 'PETROL', gasoline: 'PETROL',
  elektro: 'ELECTRIC', electric: 'ELECTRIC', elektrina: 'ELECTRIC',
  hybrid: 'HYBRID', hybridný: 'HYBRID', hybridni: 'HYBRID',
  lpg: 'LPG',
  cng: 'CNG',
}

const TRANS_MAP: Record<string, TransmissionType> = {
  manual: 'MANUAL', manuál: 'MANUAL', manualna: 'MANUAL', manuálna: 'MANUAL',
  automatic: 'AUTOMATIC', automat: 'AUTOMATIC', automatická: 'AUTOMATIC',
  'semi-automatic': 'SEMI_AUTOMATIC', semiautomat: 'SEMI_AUTOMATIC',
}

const BODY_MAP: Record<string, BodyType> = {
  sedan: 'SEDAN',
  hatchback: 'HATCHBACK',
  kombi: 'ESTATE', estate: 'ESTATE', wagon: 'ESTATE',
  suv: 'SUV', offroad: 'SUV', 'off-road': 'SUV',
  coupe: 'COUPE', kupé: 'COUPE',
  kabriolet: 'CONVERTIBLE', convertible: 'CONVERTIBLE', cabriolet: 'CONVERTIBLE',
  van: 'VAN', dodávka: 'VAN',
  pickup: 'PICKUP',
}

const STATUS_MAP: Record<string, VehicleStatus> = {
  active: 'AVAILABLE', aktívny: 'AVAILABLE', aktivny: 'AVAILABLE', available: 'AVAILABLE',
  reserved: 'RESERVED', rezervovaný: 'RESERVED', rezervovany: 'RESERVED',
  sold: 'SOLD', predaný: 'SOLD', predany: 'SOLD', inactive: 'SOLD',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function num(v: unknown): number {
  const n = parseFloat(str(v).replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function parseFuel(v: string): FuelType {
  return FUEL_MAP[v.toLowerCase().trim()] ?? 'PETROL'
}

function parseTrans(v: string): TransmissionType {
  return TRANS_MAP[v.toLowerCase().trim()] ?? 'MANUAL'
}

function parseBody(v: string): BodyType | undefined {
  return BODY_MAP[v.toLowerCase().trim()]
}

function parseStatus(v: string): VehicleStatus {
  return STATUS_MAP[v.toLowerCase().trim()] ?? 'AVAILABLE'
}

function coalesce(...values: unknown[]): string {
  for (const v of values) {
    const s = str(v)
    if (s) return s
  }
  return ''
}

function extractImageUrls(item: Record<string, unknown>): string[] {
  const urls: string[] = []

  // Try various image container structures
  const containers = [
    item.images, item.photos, item.fotky, item.fotos, item.pictures,
    item.image, item.photo,
  ]

  for (const container of containers) {
    if (!container) continue

    if (typeof container === 'string' && container.startsWith('http')) {
      urls.push(container)
      continue
    }

    if (typeof container === 'object' && container !== null) {
      const c = container as Record<string, unknown>
      const inner = c.image ?? c.photo ?? c.fotka ?? c.url ?? c.src ?? c['#text']

      if (Array.isArray(inner)) {
        inner.forEach((u) => {
          const s = typeof u === 'string' ? u : str(u['#text'] ?? u)
          if (s.startsWith('http')) urls.push(s)
        })
      } else if (typeof inner === 'string' && inner.startsWith('http')) {
        urls.push(inner)
      }
    }
  }

  return [...new Set(urls)]
}

function mapItemToVehicle(item: Record<string, unknown>): ParsedVehicle | null {
  const externalId = coalesce(item.id, item['@_id'], item.offer_id, item.externalId)
  if (!externalId) return null

  const make = coalesce(item.brand, item.znacka, item.značka, item.make, item.marka)
  const model = coalesce(item.model, item.Model)
  if (!make || !model) return null

  const title = coalesce(
    item.title, item.nadpis, item.nazev, item.nazov,
    `${make} ${model}`,
  )

  const fuelRaw = coalesce(item.fuel_type, item.palivo, item.fuel, item.pohon)
  const transRaw = coalesce(item.gearbox, item.prevod, item.prevodovka, item.transmission)
  const bodyRaw = coalesce(item.body_type, item.karoseria, item.karoséria, item.bodytype)
  const statusRaw = coalesce(item.status, item.stav, 'active')

  const features: string[] = []
  const featureRaw = item.features ?? item.vybava ?? item.výbava ?? item.equipment
  if (typeof featureRaw === 'string') {
    features.push(...featureRaw.split(',').map((s: string) => s.trim()).filter(Boolean))
  }

  return {
    externalId,
    title,
    make,
    model,
    variant: str(item.variant ?? item.verzia ?? item.version) || undefined,
    year: Math.round(num(item.year ?? item.rok ?? item.vyrobny_rok ?? item.vyrobni_rok)) || new Date().getFullYear(),
    price: num(item.price ?? item.cena ?? item.price_eur),
    mileage: Math.round(num(item.mileage ?? item.km ?? item.tachometer ?? item.najazd)),
    fuelType: parseFuel(fuelRaw),
    transmission: parseTrans(transRaw),
    bodyType: parseBody(bodyRaw),
    engineCapacity: Math.round(num(item.engine_volume ?? item.objem ?? item.ccm)) || undefined,
    power: Math.round(num(item.power ?? item.vykon ?? item.power_hp)) || undefined,
    color: str(item.color ?? item.farba ?? item.colour ?? item.barva) || undefined,
    doors: Math.round(num(item.doors ?? item.dvere)) || undefined,
    seats: Math.round(num(item.seats ?? item.miesta)) || undefined,
    description: str(item.description ?? item.popis ?? item.text) || undefined,
    features,
    imageUrls: extractImageUrls(item),
    status: parseStatus(statusRaw),
  }
}

function findVehicleArray(root: Record<string, unknown>): Record<string, unknown>[] {
  // Try common root element names
  const keys = Object.keys(root)

  const containerKeys = ['offers', 'cars', 'inzeraty', 'inzeráty', 'vehicles', 'data', 'items', 'autá', 'auta']
  const itemKeys = ['offer', 'car', 'inzerat', 'inzerát', 'vehicle', 'item', 'auto']

  for (const containerKey of containerKeys) {
    const container = root[containerKey]
    if (!container || typeof container !== 'object') continue

    const c = container as Record<string, unknown>
    for (const itemKey of itemKeys) {
      if (c[itemKey]) {
        const items = c[itemKey]
        return Array.isArray(items) ? (items as Record<string, unknown>[]) : [items as Record<string, unknown>]
      }
    }
  }

  // Try root-level item arrays
  for (const key of keys) {
    const val = root[key]
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      return val
    }
  }

  return []
}

// ─── Public API ────────────────────────────────────────────────────────────

export function parseXmlFeed(xmlString: string): ParsedVehicle[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
    trimValues: true,
    isArray: (name) =>
      ['offer', 'car', 'inzerat', 'inzerát', 'vehicle', 'item', 'auto',
       'image', 'photo', 'fotka', 'img'].includes(name.toLowerCase()),
  })

  const parsed = parser.parse(xmlString) as Record<string, unknown>
  const items = findVehicleArray(parsed)

  const vehicles: ParsedVehicle[] = []
  for (const item of items) {
    const vehicle = mapItemToVehicle(item as Record<string, unknown>)
    if (vehicle) vehicles.push(vehicle)
  }

  return vehicles
}
