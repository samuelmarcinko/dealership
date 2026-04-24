/**
 * XML Feed Parser for automotive imports
 *
 * Supports:
 *   – autobazar.sk  <advertisements><advertisement>…</advertisement></advertisements>
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
  vin?: string
  driveType?: string
  emissionStandard?: string
  externalUrl?: string
  description?: string
  features: string[]
  extraParams?: Record<string, unknown>
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
  kombi: 'ESTATE', estate: 'ESTATE', wagon: 'ESTATE', combi: 'ESTATE',
  suv: 'SUV', offroad: 'SUV', 'off-road': 'SUV',
  coupe: 'COUPE', kupé: 'COUPE',
  kabriolet: 'CONVERTIBLE', convertible: 'CONVERTIBLE', cabriolet: 'CONVERTIBLE',
  van: 'VAN', dodávka: 'VAN',
  pickup: 'PICKUP',
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
  // autobazar.sk sends pipe-separated: "6-st. automatická|Automatická" → take last token (category)
  const parts = v.split('|').map(s => s.trim().toLowerCase())
  for (const part of parts.reverse()) {
    const found = TRANS_MAP[part]
    if (found) return found
  }
  return 'MANUAL'
}

function parseBody(v: string): BodyType | undefined {
  return BODY_MAP[v.toLowerCase().trim()]
}

function coalesce(...values: unknown[]): string {
  for (const v of values) {
    const s = str(v)
    if (s) return s
  }
  return ''
}

function pipeSplit(v: unknown): string[] {
  const s = str(v)
  if (!s) return []
  return s.split('|').map(x => x.trim()).filter(Boolean)
}

// ─── autobazar.sk specific parser ─────────────────────────────────────────

function parseAutobazarSk(item: Record<string, unknown>): ParsedVehicle | null {
  const externalId = str(item.idAdvertisement)
  if (!externalId) return null

  const make = str(item.brand)
  const model = str(item.model)
  if (!make || !model) return null

  const title = str(item.title) || `${make} ${model}`
  const externalUrl = str(item.link) || undefined

  // isReserved: "true" | "false"
  const isReserved = str(item.isReserved).toLowerCase() === 'true'
  const status: VehicleStatus = isReserved ? 'RESERVED' : 'AVAILABLE'

  // description: contentExtend is more useful than content (content is usually empty)
  const description = str(item.contentExtend) || str(item.content) || undefined

  // params sub-object
  const p = (item.params ?? {}) as Record<string, unknown>

  const price = num(p['cena'] ?? p['original-cena'])
  const mileage = Math.round(num(p['najazdene-km']))
  const year = Math.round(num(p['rok'])) || new Date().getFullYear()
  const vin = str(p['vin']) || undefined

  const fuelRaw = str(p['palivo_value'])
  const transRaw = str(p['prevodovka_value'])
  const bodyRaw = str(p['karoseria_value'])
  const colorRaw = str(p['farba_value'])
  const driveType = str(p['pohon_value']) || undefined
  const emissionStandard = str(p['norma-emisii_value']) || undefined
  const engineCapacity = Math.round(num(p['objem-motora'])) || undefined
  const powerKw = Math.round(num(p['vykon-motora'])) || undefined
  const doors = Math.round(num(p['pocet-dveri_value'])) || undefined
  const seats = Math.round(num(p['miest-na-sedenie_value'])) || undefined

  // Features: pipe-separated list from vybava_value
  const features = pipeSplit(p['vybava_value'])

  // Extra params stored as JSON for display on detail page
  const extraParams: Record<string, unknown> = {}
  const consumptionUrban = str(p['v-meste'])
  const consumptionRural = str(p['mimo-mesta'])
  const consumptionCombined = str(p['kombinovana'])
  const co2 = str(p['emisie-co2'])
  const tireSize = str(p['rozmer-pneu'])
  const maxSpeed = str(p['max.-rychlost'])
  const acceleration = str(p['zrychlenie'])
  const additionalInfo = pipeSplit(p['doplnujuce-udaje_value'])
  // Specific equipment detail fields
  const airConditioning = str(p['klimatizacia_value'])
  const parkingSensors = str(p['parkovacie-senzory_value'])
  const heatedSeats = str(p['vyhrievane-sedacky_value'])
  const electricWindows = str(p['elektricke-okna_value'])
  const airbags = str(p['airbagy---pocet_value'])
  const xenon = str(p['xenonove-svetlomety_value'])
  const radio = str(p['autoradio_value'])

  if (consumptionUrban) extraParams['consumptionUrban'] = consumptionUrban
  if (consumptionRural) extraParams['consumptionRural'] = consumptionRural
  if (consumptionCombined) extraParams['consumptionCombined'] = consumptionCombined
  if (co2) extraParams['co2'] = co2
  if (tireSize) extraParams['tireSize'] = tireSize
  if (maxSpeed) extraParams['maxSpeed'] = maxSpeed
  if (acceleration) extraParams['acceleration'] = acceleration
  if (additionalInfo.length > 0) extraParams['additionalInfo'] = additionalInfo
  if (airConditioning) extraParams['airConditioning'] = airConditioning
  if (parkingSensors) extraParams['parkingSensors'] = parkingSensors
  if (heatedSeats) extraParams['heatedSeats'] = heatedSeats
  if (electricWindows) extraParams['electricWindows'] = electricWindows
  if (airbags) extraParams['airbags'] = airbags
  if (xenon) extraParams['xenon'] = xenon
  if (radio) extraParams['radio'] = radio

  // Photos from <photos><photo>URL</photo></photos>
  const imageUrls: string[] = []
  const photosContainer = item.photos as Record<string, unknown> | undefined
  if (photosContainer) {
    const photoRaw = photosContainer.photo
    if (Array.isArray(photoRaw)) {
      photoRaw.forEach((u: unknown) => {
        const url = str(u)
        if (url.startsWith('http')) imageUrls.push(url)
      })
    } else if (typeof photoRaw === 'string' && photoRaw.startsWith('http')) {
      imageUrls.push(photoRaw)
    }
  }

  return {
    externalId,
    title,
    make,
    model,
    year,
    price,
    mileage,
    fuelType: parseFuel(fuelRaw),
    transmission: parseTrans(transRaw),
    bodyType: parseBody(bodyRaw),
    engineCapacity,
    power: powerKw,
    color: colorRaw || undefined,
    doors,
    seats,
    vin,
    driveType,
    emissionStandard,
    externalUrl,
    description,
    features,
    extraParams: Object.keys(extraParams).length > 0 ? extraParams : undefined,
    imageUrls,
    status,
  }
}

// ─── Generic parser (other formats) ───────────────────────────────────────

function extractImageUrlsGeneric(item: Record<string, unknown>): string[] {
  const urls: string[] = []

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
          const s = typeof u === 'string' ? u : str((u as Record<string, unknown>)['#text'] ?? u)
          if (s.startsWith('http')) urls.push(s)
        })
      } else if (typeof inner === 'string' && inner.startsWith('http')) {
        urls.push(inner)
      }
    }
  }

  return [...new Set(urls)]
}

function mapGenericItemToVehicle(item: Record<string, unknown>): ParsedVehicle | null {
  const externalId = coalesce(item.id, item['@_id'], item.offer_id, item.externalId)
  if (!externalId) return null

  const make = coalesce(item.brand, item.znacka, item.značka, item.make, item.marka)
  const model = coalesce(item.model, item.Model)
  if (!make || !model) return null

  const title = coalesce(item.title, item.nadpis, item.nazev, item.nazov, `${make} ${model}`)

  const fuelRaw = coalesce(item.fuel_type, item.palivo, item.fuel)
  const transRaw = coalesce(item.gearbox, item.prevod, item.prevodovka, item.transmission)
  const bodyRaw = coalesce(item.body_type, item.karoseria, item.karoséria, item.bodytype)
  const statusRaw = coalesce(item.status, item.stav, 'active')

  const STATUS_MAP: Record<string, VehicleStatus> = {
    active: 'AVAILABLE', aktívny: 'AVAILABLE', aktivny: 'AVAILABLE', available: 'AVAILABLE',
    reserved: 'RESERVED', rezervovaný: 'RESERVED', rezervovany: 'RESERVED',
    sold: 'SOLD', predaný: 'SOLD', predany: 'SOLD', inactive: 'SOLD',
  }

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
    year: Math.round(num(item.year ?? item.rok ?? item.vyrobny_rok)) || new Date().getFullYear(),
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
    vin: str(item.vin) || undefined,
    description: str(item.description ?? item.popis ?? item.text) || undefined,
    features,
    imageUrls: extractImageUrlsGeneric(item),
    status: STATUS_MAP[statusRaw.toLowerCase()] ?? 'AVAILABLE',
  }
}

// ─── Root element detection ────────────────────────────────────────────────

type FeedFormat = 'autobazar_sk' | 'generic'

function detectFormat(root: Record<string, unknown>): FeedFormat {
  if (root.advertisements) return 'autobazar_sk'
  return 'generic'
}

function findVehicleArray(root: Record<string, unknown>): { items: Record<string, unknown>[]; format: FeedFormat } {
  const format = detectFormat(root)

  if (format === 'autobazar_sk') {
    const ads = root.advertisements as Record<string, unknown>
    const raw = ads?.advertisement
    const items = Array.isArray(raw) ? raw : (raw ? [raw] : [])
    return { items: items as Record<string, unknown>[], format }
  }

  // Generic formats
  const containerKeys = ['offers', 'cars', 'inzeraty', 'inzeráty', 'vehicles', 'data', 'items', 'autá', 'auta']
  const itemKeys = ['offer', 'car', 'inzerat', 'inzerát', 'vehicle', 'item', 'auto']

  for (const containerKey of containerKeys) {
    const container = root[containerKey]
    if (!container || typeof container !== 'object') continue
    const c = container as Record<string, unknown>
    for (const itemKey of itemKeys) {
      if (c[itemKey]) {
        const items = c[itemKey]
        return {
          items: Array.isArray(items) ? (items as Record<string, unknown>[]) : [items as Record<string, unknown>],
          format: 'generic',
        }
      }
    }
  }

  // Fallback: root-level arrays
  for (const key of Object.keys(root)) {
    const val = root[key]
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      return { items: val as Record<string, unknown>[], format: 'generic' }
    }
  }

  return { items: [], format: 'generic' }
}

// ─── Public API ────────────────────────────────────────────────────────────

export function parseXmlFeed(xmlString: string): ParsedVehicle[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '__cdata',
    parseAttributeValue: true,
    trimValues: true,
    isArray: (name) =>
      ['offer', 'car', 'inzerat', 'inzerát', 'vehicle', 'item', 'auto', 'advertisement',
       'image', 'photo', 'fotka', 'img'].includes(name.toLowerCase()),
  })

  const parsed = parser.parse(xmlString) as Record<string, unknown>

  // fast-xml-parser with cdataPropName puts CDATA text into __cdata — unwrap it
  const unwrapped = unwrapCdata(parsed) as Record<string, unknown>

  const { items, format } = findVehicleArray(unwrapped)

  const vehicles: ParsedVehicle[] = []
  for (const item of items) {
    const vehicle = format === 'autobazar_sk'
      ? parseAutobazarSk(item as Record<string, unknown>)
      : mapGenericItemToVehicle(item as Record<string, unknown>)
    if (vehicle) vehicles.push(vehicle)
  }

  return vehicles
}

// Recursively unwrap { __cdata: "value" } → "value"
function unwrapCdata(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(unwrapCdata)
  if (obj !== null && typeof obj === 'object') {
    const o = obj as Record<string, unknown>
    if ('__cdata' in o) return str(o['__cdata'])
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(o)) {
      result[key] = unwrapCdata(o[key])
    }
    return result
  }
  return obj
}
