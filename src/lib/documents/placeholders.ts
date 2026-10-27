/**
 * Zástupné premenné v šablónach dokumentov — jediný zdroj pravdy.
 *
 * Katalóg (PLACEHOLDER_GROUPS) aj dopĺňanie hodnôt (buildPlaceholderValues)
 * žijú v tomto module, takže sa nemôžu rozísť. Admin UI aj generovanie
 * importujú odtiaľto.
 */

import type { Customer, Vehicle } from '@prisma/client'
import {
  fuelTypeLabel,
  transmissionLabel,
  bodyTypeLabel,
  formatMileage,
} from '@/lib/utils'

// ── Katalóg pre UI ─────────────────────────────────────────────────────────

export interface PlaceholderDef {
  key: string
  label: string
}

export interface PlaceholderGroup {
  title: string
  hint?: string
  items: PlaceholderDef[]
}

const PERSON_ITEMS = (prefix: string): PlaceholderDef[] => [
  { key: `${prefix}_nazov`, label: 'Meno alebo názov firmy' },
  { key: `${prefix}_cele_meno`, label: 'Meno a priezvisko' },
  { key: `${prefix}_meno`, label: 'Meno' },
  { key: `${prefix}_priezvisko`, label: 'Priezvisko' },
  { key: `${prefix}_firma`, label: 'Názov firmy' },
  { key: `${prefix}_adresa`, label: 'Adresa' },
  { key: `${prefix}_datum_narodenia`, label: 'Dátum narodenia' },
  { key: `${prefix}_op`, label: 'Číslo OP' },
  { key: `${prefix}_ucet`, label: 'Číslo účtu / IBAN' },
  { key: `${prefix}_telefon`, label: 'Telefón' },
  { key: `${prefix}_email`, label: 'E-mail' },
  { key: `${prefix}_ico`, label: 'IČO' },
  { key: `${prefix}_dic`, label: 'DIČ' },
  { key: `${prefix}_ic_dph`, label: 'IČ DPH' },
]

export const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    title: 'Zmluvná strana',
    hint: 'Doplní sa osoba, ktorej sa dokument týka — pri prevzatí komitent, pri predaji kupujúci.',
    items: PERSON_ITEMS('klient'),
  },
  {
    title: 'Komitent',
    hint: 'Vždy vlastník komisného vozidla, aj v dokumente o predaji.',
    items: PERSON_ITEMS('komitent'),
  },
  {
    title: 'Vozidlo',
    items: [
      { key: 'vozidlo_titul', label: 'Celý názov' },
      { key: 'vozidlo_znacka', label: 'Značka' },
      { key: 'vozidlo_model', label: 'Model' },
      { key: 'vozidlo_variant', label: 'Variant' },
      { key: 'vozidlo_rok', label: 'Rok výroby' },
      { key: 'vozidlo_prva_registracia', label: 'Dátum prvej registrácie' },
      { key: 'vozidlo_vin', label: 'VIN / číslo karosérie' },
      { key: 'vozidlo_ecv', label: 'Evidenčné číslo (ŠPZ)' },
      { key: 'vozidlo_cislo_tp', label: 'Číslo technického preukazu' },
      { key: 'vozidlo_km', label: 'Stav tachometra' },
      { key: 'vozidlo_km_vyhlasenie', label: 'Stav tachometra podľa vyhlásenia majiteľa' },
      { key: 'vozidlo_farba', label: 'Farba' },
      { key: 'vozidlo_palivo', label: 'Palivo' },
      { key: 'vozidlo_prevodovka', label: 'Prevodovka' },
      { key: 'vozidlo_karoseria', label: 'Karoséria' },
      { key: 'vozidlo_objem', label: 'Objem motora' },
      { key: 'vozidlo_vykon', label: 'Výkon' },
      { key: 'vozidlo_dvere', label: 'Počet dverí' },
      { key: 'vozidlo_sedadla', label: 'Počet miest' },
      { key: 'vozidlo_stk', label: 'Platnosť STK' },
      { key: 'vozidlo_ek', label: 'Platnosť EK' },
      { key: 'vozidlo_zavady', label: 'Závady vozidla' },
      { key: 'vozidlo_cena', label: 'Inzerovaná cena' },
    ],
  },
  {
    title: 'Predaj',
    items: [
      { key: 'predaj_cena', label: 'Predajná cena' },
      { key: 'predaj_cena_cislo', label: 'Predajná cena (len číslo)' },
      { key: 'predaj_cena_slovom', label: 'Predajná cena slovom' },
      { key: 'predaj_datum', label: 'Dátum predaja' },
      { key: 'predaj_poznamka', label: 'Poznámka k predaju' },
    ],
  },
  {
    title: 'Komisia',
    items: [
      { key: 'komisia_sadzba', label: 'Sadzba provízie' },
      { key: 'komisia_odmena', label: 'Výška provízie' },
    ],
  },
  {
    title: 'Autobazár',
    hint: 'Dopĺňa sa z Nastavení.',
    items: [
      { key: 'predajca_nazov', label: 'Názov' },
      { key: 'predajca_adresa', label: 'Adresa' },
      { key: 'predajca_telefon', label: 'Telefón' },
      { key: 'predajca_email', label: 'E-mail' },
      { key: 'predajca_ico', label: 'IČO' },
      { key: 'predajca_dic', label: 'DIČ' },
      { key: 'predajca_ic_dph', label: 'IČ DPH' },
    ],
  },
  {
    title: 'Ostatné',
    items: [
      { key: 'datum_dnes', label: 'Dnešný dátum' },
      { key: 'miesto', label: 'Miesto (z adresy bazára)' },
    ],
  },
]

export const ALL_PLACEHOLDER_KEYS: ReadonlySet<string> = new Set(
  PLACEHOLDER_GROUPS.flatMap((g) => g.items.map((i) => i.key)),
)

// ── Formátovanie ───────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function money(v: unknown): string {
  if (v === null || v === undefined) return ''
  const n = Number(v)
  if (Number.isNaN(n)) return ''
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(n)
}

function date(v: Date | null | undefined): string {
  if (!v) return ''
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(v)
}

function monthYear(month: number | null, year: number | null): string {
  if (!month || !year) return ''
  return `${String(month).padStart(2, '0')}/${year}`
}

// ── Číslo slovom (pre „cena slovom“ v zmluvách) ────────────────────────────

const ONES = ['nula', 'jeden', 'dva', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť']
const TEENS = [
  'desať', 'jedenásť', 'dvanásť', 'trinásť', 'štrnásť',
  'pätnásť', 'šestnásť', 'sedemnásť', 'osemnásť', 'devätnásť',
]
const TENS = [
  '', '', 'dvadsať', 'tridsať', 'štyridsať',
  'päťdesiat', 'šesťdesiat', 'sedemdesiat', 'osemdesiat', 'deväťdesiat',
]
const HUNDREDS = [
  '', 'sto', 'dvesto', 'tristo', 'štyristo',
  'päťsto', 'šesťsto', 'sedemsto', 'osemsto', 'deväťsto',
]

function under1000(n: number): string {
  let out = HUNDREDS[Math.floor(n / 100)]
  const rest = n % 100
  if (rest >= 10 && rest < 20) out += TEENS[rest - 10]
  else {
    out += TENS[Math.floor(rest / 10)]
    if (rest % 10 > 0) out += ONES[rest % 10]
  }
  return out
}

/** Prevedie celé euro na slovenský text, napr. 19970 → „devätnásťtisícdeväťstosedemdesiat“. */
export function numberToSlovakWords(value: number): string {
  const n = Math.floor(Math.abs(value))
  if (n === 0) return 'nula'
  if (n >= 1_000_000_000) return String(n)

  const parts: string[] = []
  const millions = Math.floor(n / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1000)
  const rest = n % 1000

  if (millions > 0) {
    if (millions === 1) parts.push('jedenmilión')
    else if (millions < 5) parts.push(`${under1000(millions)}milióny`)
    else parts.push(`${under1000(millions)}miliónov`)
  }
  if (thousands > 0) {
    if (thousands === 1) parts.push('tisíc')
    else {
      // „dvetisíc“, „dvadsaťdvetisíc“ — pri tisícoch sa používa tvar „dve“
      parts.push(`${under1000(thousands).replace(/dva$/, 'dve')}tisíc`)
    }
  }
  if (rest > 0) parts.push(under1000(rest))

  return parts.join('')
}

// ── Dopĺňanie hodnôt ───────────────────────────────────────────────────────

export type DocumentParty = 'buyer' | 'consignor'

type VehicleWithParties = Vehicle & {
  buyer: Customer | null
  consignor: Customer | null
}

function personValues(prefix: string, c: Customer | null): Record<string, string> {
  const fullName = c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() : ''
  const display = c
    ? c.type === 'COMPANY'
      ? str(c.companyName)
      : fullName
    : ''

  return {
    [`${prefix}_nazov`]: display,
    [`${prefix}_cele_meno`]: fullName,
    [`${prefix}_meno`]: str(c?.firstName),
    [`${prefix}_priezvisko`]: str(c?.lastName),
    [`${prefix}_firma`]: str(c?.companyName),
    [`${prefix}_adresa`]: str(c?.address),
    [`${prefix}_datum_narodenia`]: date(c?.birthDate),
    [`${prefix}_op`]: str(c?.idCardNumber),
    [`${prefix}_ucet`]: str(c?.bankAccount),
    [`${prefix}_telefon`]: str(c?.phone),
    [`${prefix}_email`]: str(c?.email),
    [`${prefix}_ico`]: str(c?.ico),
    [`${prefix}_dic`]: str(c?.dic),
    [`${prefix}_ic_dph`]: str(c?.icDph),
  }
}

export function buildPlaceholderValues(opts: {
  vehicle: VehicleWithParties
  party: DocumentParty
  settings: Record<string, string>
}): Record<string, string> {
  const { vehicle, party, settings } = opts
  const s = settings
  const counterparty = party === 'consignor' ? vehicle.consignor : vehicle.buyer

  const address = str(s['contact_address'])
  // „V Prešove dňa…“ – mesto sa odhadne z poslednej časti adresy
  const city = address.split(',').map((p) => p.trim()).filter(Boolean).pop() ?? ''

  const soldPrice = vehicle.soldPrice != null ? Number(vehicle.soldPrice) : null

  return {
    ...personValues('klient', counterparty),
    ...personValues('komitent', vehicle.consignor),

    vozidlo_titul: str(vehicle.title),
    vozidlo_znacka: str(vehicle.make),
    vozidlo_model: str(vehicle.model),
    vozidlo_variant: str(vehicle.variant),
    vozidlo_rok: str(vehicle.year),
    vozidlo_prva_registracia: date(vehicle.firstRegistration),
    vozidlo_vin: str(vehicle.vin),
    vozidlo_ecv: str(vehicle.licensePlate),
    vozidlo_cislo_tp: str(vehicle.registrationDocNumber),
    vozidlo_km: formatMileage(vehicle.mileage),
    vozidlo_km_vyhlasenie:
      vehicle.declaredMileage != null ? formatMileage(vehicle.declaredMileage) : '',
    vozidlo_farba: str(vehicle.color),
    vozidlo_palivo: fuelTypeLabel(vehicle.fuelType),
    vozidlo_prevodovka: transmissionLabel(vehicle.transmission),
    vozidlo_karoseria: vehicle.bodyType ? bodyTypeLabel(vehicle.bodyType) : '',
    vozidlo_objem: vehicle.engineCapacity ? `${vehicle.engineCapacity} cm³` : '',
    vozidlo_vykon: vehicle.power ? `${vehicle.power} kW` : '',
    vozidlo_dvere: str(vehicle.doors),
    vozidlo_sedadla: str(vehicle.seats),
    vozidlo_stk: monthYear(vehicle.stkMonth, vehicle.stkYear),
    vozidlo_ek: monthYear(vehicle.ekMonth, vehicle.ekYear),
    vozidlo_zavady: vehicle.defects.length > 0 ? vehicle.defects.join(', ') : 'bez závad',
    vozidlo_cena: money(vehicle.salePrice ?? vehicle.price),

    predaj_cena: money(soldPrice),
    predaj_cena_cislo: soldPrice != null ? String(soldPrice) : '',
    predaj_cena_slovom: soldPrice != null ? `${numberToSlovakWords(soldPrice)} eur` : '',
    predaj_datum: date(vehicle.soldAt),
    predaj_poznamka: str(vehicle.soldNote),

    komisia_sadzba: vehicle.commissionRate != null ? `${Number(vehicle.commissionRate)} %` : '',
    komisia_odmena: money(vehicle.commissionAmount),

    predajca_nazov: str(s['business_name']),
    predajca_adresa: address,
    predajca_telefon: str(s['contact_phone']),
    predajca_email: str(s['contact_email']),
    predajca_ico: str(s['business_ico']),
    predajca_dic: str(s['business_dic']),
    predajca_ic_dph: str(s['business_ic_dph']),

    datum_dnes: date(new Date()),
    miesto: city,
  }
}

// ── Dosadenie do šablóny ───────────────────────────────────────────────────

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const TOKEN_RE = /\{([a-z0-9_]+)\}/gi

/** Vráti zoznam premenných, ktoré šablóna používa. */
export function extractPlaceholders(html: string): string[] {
  const found = new Set<string>()
  for (const m of html.matchAll(TOKEN_RE)) found.add(m[1])
  return [...found]
}

/**
 * Dosadí hodnoty do HTML šablóny. Hodnoty sa escapujú, aby text z databázy
 * nemohol rozbiť značkovanie. Neznáme premenné zostávajú nedotknuté, nech
 * si ich používateľ v náhľade všimne.
 */
export function renderTemplate(html: string, values: Record<string, string>): string {
  return html.replace(TOKEN_RE, (match, key: string) =>
    key in values ? escapeHtml(values[key]) : match,
  )
}
