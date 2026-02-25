import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { getTenantSettings } from '@/lib/tenant'
import { fuelTypeLabel, transmissionLabel, bodyTypeLabel, formatMileage } from '@/lib/utils'
import type { FuelType, TransmissionType, BodyType } from '@prisma/client'

function fmt(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function fmtPrice(v: unknown): string {
  if (v === null || v === undefined) return ''
  const n = Number(v)
  return isNaN(n) ? '' : new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtDate(v: Date | null | undefined): string {
  if (!v) return ''
  return new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(v)
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const vehicleId = searchParams.get('vehicleId')
  const templateId = searchParams.get('templateId')

  if (!vehicleId || !templateId) {
    return NextResponse.json({ error: 'Chýba vehicleId alebo templateId' }, { status: 400 })
  }

  try {
    const [vehicle, template, settings] = await Promise.all([
      prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { buyer: true },
      }),
      prisma.documentTemplate.findUnique({ where: { id: templateId } }),
      getTenantSettings(),
    ])

    if (!vehicle) return NextResponse.json({ error: 'Vozidlo nenájdené' }, { status: 404 })
    if (!template) return NextResponse.json({ error: 'Šablóna nenájdená' }, { status: 404 })
    if (!vehicle.buyer) return NextResponse.json({ error: 'Vozidlo nemá priradeného kupujúceho' }, { status: 400 })

    const buyer = vehicle.buyer
    const displayName = buyer.type === 'COMPANY'
      ? (buyer.companyName ?? '')
      : `${buyer.firstName ?? ''} ${buyer.lastName ?? ''}`.trim()

    const data: Record<string, string> = {
      // Klient
      klient_meno:        fmt(buyer.firstName),
      klient_priezvisko:  fmt(buyer.lastName),
      klient_cele_meno:   `${fmt(buyer.firstName)} ${fmt(buyer.lastName)}`.trim(),
      klient_firma:       fmt(buyer.companyName),
      klient_nazov:       displayName,
      klient_ico:         fmt(buyer.ico),
      klient_dic:         fmt(buyer.dic),
      klient_ic_dph:      fmt(buyer.icDph),
      klient_telefon:     fmt(buyer.phone),
      klient_email:       fmt(buyer.email),
      klient_adresa:      fmt(buyer.address),

      // Vozidlo
      vozidlo_titul:      fmt(vehicle.title),
      vozidlo_znacka:     fmt(vehicle.make),
      vozidlo_model:      fmt(vehicle.model),
      vozidlo_variant:    fmt(vehicle.variant),
      vozidlo_rok:        fmt(vehicle.year),
      vozidlo_vin:        fmt(vehicle.vin),
      vozidlo_farba:      fmt(vehicle.color),
      vozidlo_km:         formatMileage(vehicle.mileage),
      vozidlo_palivo:     fuelTypeLabel(vehicle.fuelType as FuelType),
      vozidlo_prevodovka: transmissionLabel(vehicle.transmission as TransmissionType),
      vozidlo_karoseria:  vehicle.bodyType ? bodyTypeLabel(vehicle.bodyType as BodyType) : '',
      vozidlo_objem:      vehicle.engineCapacity ? `${vehicle.engineCapacity} cm³` : '',
      vozidlo_vykon:      vehicle.power ? `${vehicle.power} kW` : '',

      // Predaj
      predaj_cena:        fmtPrice(vehicle.soldPrice),
      predaj_cena_cislo:  vehicle.soldPrice ? String(Number(vehicle.soldPrice)) : '',
      predaj_datum:       fmtDate(vehicle.soldAt),
      predaj_poznamka:    fmt(vehicle.soldNote),

      // Predajca (z nastavení)
      predajca_nazov:     fmt(settings['business_name'] ?? settings['businessName']),
      predajca_adresa:    fmt(settings['contact_address'] ?? settings['contactAddress']),
      predajca_telefon:   fmt(settings['contact_phone'] ?? settings['contactPhone']),
      predajca_email:     fmt(settings['contact_email'] ?? settings['contactEmail']),
      predajca_ico:       fmt(settings['business_ico']),
      predajca_dic:       fmt(settings['business_dic']),

      // Dátum generovania
      datum_dnes:         fmtDate(new Date()),
    }

    const fileBuffer = await readFile(template.filePath)
    const zip = new PizZip(fileBuffer)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    doc.render(data)

    const output: Buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
    // Copy to a clean ArrayBuffer (TS strict: Uint8Array<ArrayBufferLike> vs ArrayBufferView<ArrayBuffer>)
    const ab = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer

    // Sanitize filename for Content-Disposition
    const safeName = template.originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const baseName = safeName.replace(/\.docx$/i, '')
    const downloadName = `${baseName}_${displayName.replace(/\s+/g, '_') || vehicleId}.docx`

    return new Response(ab, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/documents/generate]', err)
    return NextResponse.json({ error: 'Nastala chyba pri generovaní dokumentu' }, { status: 500 })
  }
}
