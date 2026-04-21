import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTenantBranding } from '@/lib/tenant'
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/equipmentData'
import PrintButton from '@/components/admin/PrintButton'

const FUEL_LABELS: Record<string, string> = {
  PETROL: 'Benzín', DIESEL: 'Diesel', ELECTRIC: 'Elektrický',
  HYBRID: 'Hybrid', LPG: 'LPG', CNG: 'CNG',
}
const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manuálna', AUTOMATIC: 'Automatická', SEMI_AUTOMATIC: 'Poloautomatická',
}
const BODY_LABELS: Record<string, string> = {
  SEDAN: 'Sedan', HATCHBACK: 'Hatchback', ESTATE: 'Kombi', SUV: 'SUV',
  COUPE: 'Coupé', CONVERTIBLE: 'Kabriolet', VAN: 'Van', PICKUP: 'Pickup', OTHER: 'Iné',
}
const MONTHS_SK = ['Jan','Feb','Mar','Apr','Máj','Jún','Júl','Aug','Sep','Okt','Nov','Dec']

function fmt(n: number) {
  return n.toLocaleString('sk-SK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default async function VehicleLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [vehicle, branding] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id } }),
    getTenantBranding(),
  ])
  if (!vehicle) notFound()

  const accent = branding.primaryColor || '#f97316'
  const price = Number(vehicle.price)
  const salePrice = vehicle.salePrice ? Number(vehicle.salePrice) : null
  const isPortrait = branding.labelOrientation === 'portrait'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vx = vehicle as any

  // Specs
  const specs: { icon: string; label: string; value: string }[] = []
  specs.push({ icon: 'calendar', label: 'Rok výroby', value: String(vehicle.year) })
  specs.push({ icon: 'gauge', label: 'Najazdené', value: vehicle.mileage.toLocaleString('sk-SK') + ' km' })
  specs.push({ icon: 'fuel', label: 'Palivo', value: FUEL_LABELS[vehicle.fuelType] ?? vehicle.fuelType })
  specs.push({ icon: 'settings2', label: 'Prevodovka', value: TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission })
  if (vehicle.bodyType) specs.push({ icon: 'car', label: 'Karoséria', value: BODY_LABELS[vehicle.bodyType] ?? vehicle.bodyType })
  const eng: string[] = []
  if (vehicle.engineCapacity) eng.push((vehicle.engineCapacity / 1000).toFixed(1) + ' l')
  if (vehicle.power) eng.push(vehicle.power + ' kW')
  if (eng.length) specs.push({ icon: 'cog', label: 'Motor', value: eng.join(' · ') })
  if (vehicle.color) specs.push({ icon: 'palette', label: 'Farba', value: vehicle.color })
  const ds: string[] = []
  if (vehicle.doors) ds.push(vehicle.doors + ' dvere')
  if (vehicle.seats) ds.push(vehicle.seats + ' miest')
  if (ds.length) specs.push({ icon: 'door-open', label: 'Dvere / Miesta', value: ds.join(' · ') })
  if (vehicle.vin) specs.push({ icon: 'hash', label: 'VIN', value: vehicle.vin.slice(0, 17) })
  if (vx.stkMonth && vx.stkYear) specs.push({ icon: 'shield', label: 'Platnosť STK', value: `${MONTHS_SK[vx.stkMonth - 1]} ${vx.stkYear}` })
  if (vx.ekMonth && vx.ekYear) specs.push({ icon: 'shield', label: 'Platnosť EK', value: `${MONTHS_SK[vx.ekMonth - 1]} ${vx.ekYear}` })

  // Equipment
  const MAX_ITEMS = isPortrait ? 6 : 8
  const featureMap: Record<string, string[]> = {
    safetyFeatures: vehicle.safetyFeatures,
    comfortFeatures: vehicle.comfortFeatures,
    multimediaFeatures: vehicle.multimediaFeatures,
    exteriorFeatures: vehicle.exteriorFeatures,
    otherFeatures: vehicle.otherFeatures,
    evFeatures: vehicle.evFeatures,
  }
  const categories = CATEGORY_ORDER
    .map((cat) => ({ cat, meta: CATEGORY_META[cat], items: featureMap[CATEGORY_META[cat].field] ?? [] }))
    .filter(({ items }) => items.length > 0)

  // Strip HTML tags from description, limit length
  const description = vehicle.description
    ? vehicle.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, isPortrait ? 350 : 200)
    : null

  if (isPortrait) {
    return (
      <>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root { --accent: ${accent}; }
          html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden; background: white; font-family: Arial, Helvetica, sans-serif; }
          @page { size: A4 portrait; margin: 0; }
          @media print { .no-print { display: none !important; } html, body { width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden; } }
          .wrap { display: flex; flex-direction: column; width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden; background: white; padding: 6mm; }
          .hdr { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; border-bottom: 3px solid var(--accent); }
          .hdr-name { font-size: 12px; font-weight: 700; color: #334155; letter-spacing: 0.03em; text-transform: uppercase; }
          .identity { flex-shrink: 0; text-align: center; padding: 10px 8px 8px; border-bottom: 1px solid #e2e8f0; background: #fafafa; }
          .vehicle-title { font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1.2; }
          .price-block { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          .price-old { font-size: 18px; font-weight: 700; color: #475569; text-decoration: line-through; }
          .price-main { font-size: 56px; font-weight: 900; color: var(--accent); line-height: 1; letter-spacing: -0.03em; display: flex; align-items: baseline; gap: 4px; }
          .price-eur { font-size: 28px; font-weight: 800; }
          .price-label { font-size: 18px; font-weight: 600; color: #000; text-transform: uppercase; }
          .specs { flex-shrink: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          .spec-row { display: flex; align-items: center; gap: 7px; padding: 3px 3px; }
          .spec-icon { color: var(--accent); flex-shrink: 0; width: 20px; height: 20px; }
          .spec-text { display: flex; flex-direction: column; min-width: 0; }
          .spec-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; }
          .spec-value { font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .desc-block { flex-shrink: 0; padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
          .desc-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; margin-bottom: 2px; }
          .desc-text { font-size: 10px; color: #475569; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
          .features { flex: 1; display: grid; grid-template-columns: 1fr 1fr; align-content: start; gap: 5px 10px; padding: 6px 8px; overflow: hidden; }
          .feat-cat { display: flex; flex-direction: column; gap: 1px; }
          .feat-cat-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: var(--accent); margin-bottom: 2px; padding-bottom: 1px; border-bottom: 1px solid var(--accent); }
          .feat-item { font-size: 11px; color: #334155; display: flex; align-items: flex-start; gap: 3px; line-height: 1.3; }
          .feat-check { color: var(--accent); font-weight: 800; flex-shrink: 0; }
          .feat-more { font-size: 9px; color: #94a3b8; margin-top: 1px; }
          .ftr { flex-shrink: 0; border-top: 2px solid var(--accent); padding: 5px 10px; display: flex; align-items: center; justify-content: center; gap: 16px; background: #f8fafc; }
          .ftr-item { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 500; color: #475569; }
          .ftr-icon { color: var(--accent); width: 12px; height: 12px; flex-shrink: 0; }
        `}</style>
        <div className="wrap">
          <div className="hdr">
            <span className="hdr-name">{branding.businessName}</span>
            <PrintButton />
          </div>
          <div className="identity">
            <div className="vehicle-title">{vehicle.title}</div>
          </div>
          <div className="price-block">
            {salePrice ? (
              <>
                <div className="price-old">{fmt(price)} €</div>
                <div className="price-main">{fmt(salePrice)}<span className="price-eur">€</span></div>
                <div className="price-label">Akciová cena</div>
              </>
            ) : (
              <div className="price-main">{fmt(price)}<span className="price-eur">€</span></div>
            )}
          </div>
          <div className="specs">
            {specs.map((s) => (
              <div key={s.label} className="spec-row">
                <SpecIcon name={s.icon} />
                <div className="spec-text">
                  <span className="spec-label">{s.label}</span>
                  <span className="spec-value">{s.value}</span>
                </div>
              </div>
            ))}
          </div>
          {description && (
            <div className="desc-block">
              <div className="desc-title">Popis vozidla</div>
              <p className="desc-text">{description}</p>
            </div>
          )}
          <div className="features">
            {categories.map(({ cat, meta, items }) => (
              <div key={cat} className="feat-cat">
                <div className="feat-cat-title">{meta.label}</div>
                {items.slice(0, MAX_ITEMS).map((item) => (
                  <div key={item} className="feat-item">
                    <span className="feat-check">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
                {items.length > MAX_ITEMS && (
                  <div className="feat-more">+{items.length - MAX_ITEMS} ďalších</div>
                )}
              </div>
            ))}
          </div>
          <div className="ftr">
            {branding.contactPhone && <span className="ftr-item"><PhoneIcon />{branding.contactPhone}</span>}
            {branding.contactEmail && <span className="ftr-item"><MailIcon />{branding.contactEmail}</span>}
            {branding.contactAddress && <span className="ftr-item"><MapPinIcon />{branding.contactAddress}</span>}
          </div>
        </div>
      </>
    )
  }

  // ── LANDSCAPE (default) ──────────────────────────────────────────────────
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --accent: ${accent}; }
        html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        html, body { width: 297mm; height: 210mm; max-height: 210mm; overflow: hidden; background: white; font-family: Arial, Helvetica, sans-serif; }
        @page { size: A4 landscape; margin: 0; }
        @media print { .no-print { display: none !important; } html, body { width: 297mm; height: 210mm; max-height: 210mm; overflow: hidden; } }
        .wrap { display: flex; flex-direction: column; width: 297mm; height: 210mm; max-height: 210mm; overflow: hidden; background: white; padding: 6mm; }
        .hdr { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; border-bottom: 3px solid var(--accent); background: white; }
        .hdr-name { font-size: 13px; font-weight: 700; color: #334155; letter-spacing: 0.03em; text-transform: uppercase; }
        .body { flex: 1; display: flex; min-height: 0; overflow: hidden; }
        .col-left { width: 55%; display: flex; flex-direction: column; border-right: 2px solid #e2e8f0; overflow: hidden; }
        .identity { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8px 16px 6px; border-bottom: 1px solid #e2e8f0; background: #fafafa; }
        .vehicle-title { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.15; letter-spacing: -0.01em; }
        .price-block { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 16px 6px; border-bottom: 1px solid #e2e8f0; }
        .price-old { font-size: 20px; font-weight: 700; color: #475569; text-decoration: line-through; line-height: 1.2; margin-bottom: 2px; }
        .price-main { font-size: 64px; font-weight: 900; color: var(--accent); line-height: 1; letter-spacing: -0.03em; display: flex; align-items: baseline; gap: 6px; }
        .price-eur { font-size: 32px; font-weight: 800; line-height: 1.4; }
        .price-label { font-size: 22px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 1px; }
        .specs { flex: 1; display: grid; grid-template-columns: 1fr 1fr; align-content: start; gap: 0; padding: 6px 12px; overflow: hidden; }
        .spec-row { display: flex; align-items: center; gap: 8px; padding: 4px 4px; border-radius: 4px; }
        .spec-icon { color: var(--accent); flex-shrink: 0; width: 24px; height: 24px; }
        .spec-text { display: flex; flex-direction: column; min-width: 0; }
        .spec-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; }
        .spec-value { font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .desc-block { flex-shrink: 0; padding: 4px 12px 6px; border-top: 1px solid #e2e8f0; }
        .desc-text { font-size: 10px; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .col-right { width: 45%; padding: 8px 10px; display: grid; grid-template-columns: 1fr 1fr; align-content: start; gap: 6px 10px; overflow: hidden; }
        .feat-cat { display: flex; flex-direction: column; gap: 2px; }
        .feat-cat-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: var(--accent); margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px solid var(--accent); }
        .feat-item { font-size: 12px; color: #334155; display: flex; align-items: flex-start; gap: 3px; line-height: 1.3; }
        .feat-check { color: var(--accent); font-weight: 800; flex-shrink: 0; }
        .feat-more { font-size: 9px; color: #94a3b8; margin-top: 1px; }
        .ftr { flex-shrink: 0; border-top: 2px solid var(--accent); padding: 5px 10px; display: flex; align-items: center; justify-content: center; gap: 24px; background: #f8fafc; }
        .ftr-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; color: #475569; }
        .ftr-icon { color: var(--accent); width: 13px; height: 13px; flex-shrink: 0; }
      `}</style>
      <div className="wrap">
        <div className="hdr">
          <span className="hdr-name">{branding.businessName}</span>
          <PrintButton />
        </div>
        <div className="body">
          <div className="col-left">
            <div className="identity">
              <div className="vehicle-title">{vehicle.title}</div>
            </div>
            <div className="price-block">
              {salePrice ? (
                <>
                  <div className="price-old">{fmt(price)} <span>€</span></div>
                  <div className="price-main">{fmt(salePrice)}<span className="price-eur">€</span></div>
                  <div className="price-label">Akciová cena</div>
                </>
              ) : (
                <div className="price-main">{fmt(price)}<span className="price-eur">€</span></div>
              )}
            </div>
            <div className="specs">
              {specs.map((s) => (
                <div key={s.label} className="spec-row">
                  <SpecIcon name={s.icon} />
                  <div className="spec-text">
                    <span className="spec-label">{s.label}</span>
                    <span className="spec-value">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
            {description && (
              <div className="desc-block">
                <p className="desc-text">{description}</p>
              </div>
            )}
          </div>
          <div className="col-right">
            {categories.map(({ cat, meta, items }) => (
              <div key={cat} className="feat-cat">
                <div className="feat-cat-title">{meta.label}</div>
                {items.slice(0, MAX_ITEMS).map((item) => (
                  <div key={item} className="feat-item">
                    <span className="feat-check">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
                {items.length > MAX_ITEMS && (
                  <div className="feat-more">+{items.length - MAX_ITEMS} ďalších</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="ftr">
          {branding.contactPhone && <span className="ftr-item"><PhoneIcon />{branding.contactPhone}</span>}
          {branding.contactEmail && <span className="ftr-item"><MailIcon />{branding.contactEmail}</span>}
          {branding.contactAddress && <span className="ftr-item"><MapPinIcon />{branding.contactAddress}</span>}
        </div>
      </div>
    </>
  )
}

function SpecIcon({ name }: { name: string }) {
  const s = 'spec-icon'
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const icons: Record<string, React.ReactNode> = {
    calendar: <svg className={s} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    gauge:    <svg className={s} viewBox="0 0 24 24" {...p}><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>,
    fuel:     <svg className={s} viewBox="0 0 24 24" {...p}><line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>,
    settings2:<svg className={s} viewBox="0 0 24 24" {...p}><path d="M20 7H9"/><path d="M14 17H3"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>,
    car:      <svg className={s} viewBox="0 0 24 24" {...p}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    cog:      <svg className={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>,
    palette:  <svg className={s} viewBox="0 0 24 24" {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
    'door-open': <svg className={s} viewBox="0 0 24 24" {...p}><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561z"/></svg>,
    hash:     <svg className={s} viewBox="0 0 24 24" {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
    shield:   <svg className={s} viewBox="0 0 24 24" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  }
  return <>{icons[name] ?? null}</>
}

function PhoneIcon() {
  return <svg className="ftr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function MailIcon() {
  return <svg className="ftr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
}
function MapPinIcon() {
  return <svg className="ftr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}
