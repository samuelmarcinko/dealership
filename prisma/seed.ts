import { PrismaClient, FuelType, TransmissionType, BodyType, VehicleStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin user ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dealership.com' },
    update: {},
    create: {
      email: 'admin@dealership.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })
  console.log(`Admin user: ${admin.email}`)

  // ── Tenant settings ─────────────────────────────────────────────────────────
  await prisma.tenantSettings.upsert({
    where: { key: 'xml_feed_url' },
    update: {},
    create: { key: 'xml_feed_url', value: '' },
  })
  await prisma.tenantSettings.upsert({
    where: { key: 'sync_interval_minutes' },
    update: {},
    create: { key: 'sync_interval_minutes', value: '30' },
  })
  console.log('Tenant settings created')

  // ── Sample vehicles ─────────────────────────────────────────────────────────
  const vehicles = [
    {
      title: 'Volkswagen Golf 2.0 TDI',
      make: 'Volkswagen',
      model: 'Golf',
      variant: '2.0 TDI Highline',
      year: 2021,
      price: 21990,
      mileage: 45000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.MANUAL,
      engineCapacity: 1968,
      power: 150,
      color: 'Čierna',
      bodyType: BodyType.HATCHBACK,
      doors: 5,
      seats: 5,
      description: 'Volkswagen Golf v perfektnom stave. Servisná história vedená, nefajčiarské vozidlo. Plná výbava vrátane navigácie, kúreného sedenia a adaptívneho tempomat.',
      features: ['Navigácia', 'Kúrené sedenie', 'Adaptívny tempomat', 'LED svetlá', 'Parkovací senzor'],
      status: VehicleStatus.AVAILABLE,
    },
    {
      title: 'BMW 3 Series 320d',
      make: 'BMW',
      model: '3 Series',
      variant: '320d M Sport',
      year: 2020,
      price: 32500,
      mileage: 62000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      engineCapacity: 1995,
      power: 190,
      color: 'Biela',
      bodyType: BodyType.SEDAN,
      doors: 4,
      seats: 5,
      description: 'BMW 3 Series M Sport s automatickou prevodovkou. Vozidlo bez nehôd, komplexný servis u autorizovaného predajcu.',
      features: ['M Sport paket', 'iDrive navigácia', 'Kamerový systém', 'Ambientné osvetlenie', 'Digitálna prístrojová doska'],
      status: VehicleStatus.AVAILABLE,
    },
    {
      title: 'Škoda Octavia 1.5 TSI',
      make: 'Škoda',
      model: 'Octavia',
      variant: '1.5 TSI Style',
      year: 2022,
      price: 24990,
      mileage: 28000,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      engineCapacity: 1498,
      power: 150,
      color: 'Šedá',
      bodyType: BodyType.ESTATE,
      doors: 5,
      seats: 5,
      description: 'Škoda Octavia Combi v stave ako nová. Prvý majiteľ, kompletná servisná história.',
      features: ['Canton audio', 'Panoramatická strecha', 'Virtuálne kokpity', 'SmartLink', 'Elektrické okná'],
      status: VehicleStatus.AVAILABLE,
    },
    {
      title: 'Toyota RAV4 Hybrid',
      make: 'Toyota',
      model: 'RAV4',
      variant: 'Hybrid AWD-i',
      year: 2021,
      price: 38500,
      mileage: 35000,
      fuelType: FuelType.HYBRID,
      transmission: TransmissionType.AUTOMATIC,
      engineCapacity: 2487,
      power: 218,
      color: 'Červená',
      bodyType: BodyType.SUV,
      doors: 5,
      seats: 5,
      description: 'Toyota RAV4 Hybrid s pohonom všetkých kolies. Výnimočná spotreba 5,5 l/100km. Garančná prehliadka vykonaná.',
      features: ['Hybridný pohon', 'AWD', 'JBL audio', 'Apple CarPlay', 'Bezdrôtové nabíjanie'],
      status: VehicleStatus.RESERVED,
    },
    {
      title: 'Mercedes-Benz C 220d',
      make: 'Mercedes-Benz',
      model: 'C-Class',
      variant: 'C 220d AMG Line',
      year: 2019,
      price: 29900,
      mileage: 89000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      engineCapacity: 1950,
      power: 194,
      color: 'Modrá',
      bodyType: BodyType.SEDAN,
      doors: 4,
      seats: 5,
      description: 'Mercedes-Benz C trieda AMG Line. Luxusná výbava, plná servisná história v autorizovanom servise.',
      features: ['AMG Line', 'Burmester audio', 'Head-up display', 'Masážne sedenie', 'Memory sedenie'],
      status: VehicleStatus.AVAILABLE,
    },
    {
      title: 'Audi A4 2.0 TDI',
      make: 'Audi',
      model: 'A4',
      variant: '2.0 TDI quattro S-Line',
      year: 2020,
      price: 33800,
      mileage: 52000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      engineCapacity: 1968,
      power: 190,
      color: 'Čierna',
      bodyType: BodyType.SEDAN,
      doors: 4,
      seats: 5,
      description: 'Audi A4 S-Line quattro. Pohon všetkých kolies, luxusná výbava, výborný technický stav.',
      features: ['quattro pohon', 'S-Line exteriér', 'Virtual Cockpit', 'MMI navigácia', 'Matrix LED'],
      status: VehicleStatus.SOLD,
    },
  ]

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { externalId: `seed-${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}` },
      update: {},
      create: {
        ...vehicle,
        externalId: `seed-${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}`,
      },
    })
  }
  console.log(`${vehicles.length} sample vehicles created`)

  console.log('✓ Database seeded successfully')
  console.log('  Admin login: admin@dealership.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
