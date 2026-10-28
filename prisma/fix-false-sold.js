/**
 * Oprava vozidiel, ktoré boli označené ako predané, hoci k predaju nedošlo.
 *
 * Pôvodná synchronizácia označovala každé vozidlo, ktoré zmizlo z XML feedu,
 * ako SOLD — aj keď ho majiteľ len stiahol z ponuky. Takéto vozidlo nemá
 * `soldAt`, takže sa v zozname predaných počítalo s inzerovanou cenou a nafukovalo
 * tržby. Tento skript im nastaví stav ARCHIVED (stiahnuté z ponuky).
 *
 * Spustenie — najprv náhľad, nič nemení:
 *   docker compose exec dealership node prisma/fix-false-sold.js
 *
 * Potom ostro:
 *   docker compose exec dealership node prisma/fix-false-sold.js --apply
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')

function fmtPrice(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(Number(v))
}

async function main() {
  // Skutočný predaj má vždy soldAt — nastavuje ho tlačidlo „Predať vozidlo“.
  const falseSold = await prisma.vehicle.findMany({
    where: { status: 'SOLD', soldAt: null },
    select: { id: true, title: true, price: true, externalId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const realSold = await prisma.vehicle.count({
    where: { status: 'SOLD', soldAt: { not: null } },
  })

  const fromFeed = falseSold.filter((v) => v.externalId !== null)
  const manual = falseSold.filter((v) => v.externalId === null)
  const falseRevenue = falseSold.reduce((s, v) => s + Number(v.price ?? 0), 0)

  console.log('')
  console.log('════════════════════════════════════════════════════════')
  console.log(`Skutočné predaje (majú dátum predaja):      ${realSold}`)
  console.log(`Nesprávne označené ako predané:            ${falseSold.length}`)
  console.log(`  z toho z XML feedu:                      ${fromFeed.length}`)
  console.log(`  z toho nastavené ručne v formulári:      ${manual.length}`)
  console.log(`Falošná tržba, ktorú to pridávalo:         ${fmtPrice(falseRevenue)}`)
  console.log('════════════════════════════════════════════════════════')

  if (falseSold.length === 0) {
    console.log('\nNič na opravu — dáta sú v poriadku.')
    return
  }

  console.log('\nDotknuté vozidlá:')
  for (const v of falseSold.slice(0, 20)) {
    const origin = v.externalId ? 'feed' : 'ručne'
    console.log(`  · [${origin}] ${v.title} — ${fmtPrice(v.price)}`)
  }
  if (falseSold.length > 20) console.log(`  … a ďalších ${falseSold.length - 20}`)

  if (!APPLY) {
    console.log('\nNÁHĽAD — nič sa nezmenilo.')
    console.log('Ak súhlasíš, spusti ten istý príkaz s prepínačom --apply')
    return
  }

  const result = await prisma.vehicle.updateMany({
    where: { status: 'SOLD', soldAt: null },
    data: { status: 'ARCHIVED' },
  })

  console.log(`\nHotovo — ${result.count} vozidiel presunutých do „Stiahnuté z ponuky“.`)
  console.log('V zozname predaných vozidiel aj v tržbách už nefigurujú.')
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
