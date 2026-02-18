import React from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Award, Headphones, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VehicleCard from '@/components/public/VehicleCard'
import { prisma } from '@/lib/prisma'
import type { PublicVehicle } from '@/types'

export const revalidate = 60

async function getFeaturedVehicles(): Promise<PublicVehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  })

  return vehicles.map((v) => ({
    ...v,
    primaryImage: v.images[0] ?? null,
  }))
}

const features = [
  {
    icon: Shield,
    title: 'Overené vozidlá',
    description: 'Každé vozidlo prechádza dôkladnou technickou kontrolou pred predajom.',
  },
  {
    icon: Award,
    title: 'Záruka kvality',
    description: 'Poskytujeme záruku na všetky predané vozidlá a odborné poradenstvo.',
  },
  {
    icon: TrendingDown,
    title: 'Férové ceny',
    description: 'Transparentné ceny bez skrytých poplatkov. Čo vidíte, to zaplatíte.',
  },
  {
    icon: Headphones,
    title: 'Podpora zákazníkov',
    description: 'Náš tím je tu pre vás pred aj po kúpe vozidla. Vždy chęteli poradiť.',
  },
]

export default async function HomePage() {
  const vehicles = await getFeaturedVehicles()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-4">
              Profesionálny autobazar
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Nájdite vozidlo<br />
              <span className="text-orange-400">svojich snov</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-xl">
              Ponúkame starostlivo vybrané ojazdené vozidlá za transparentné ceny.
              Každé auto prešlo technickou kontrolou a je pripravené na cestu.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/vehicles">
                  Prezerať vozidlá
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                <Link href="/contact">Kontaktujte nás</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-orange-500 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Predaných vozidiel' },
              { value: '98%', label: 'Spokojných zákazníkov' },
              { value: '10+', label: 'Rokov na trhu' },
              { value: '24/7', label: 'Online podpora' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-extrabold">{stat.value}</div>
                <div className="text-orange-100 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vehicles */}
      {vehicles.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-2">
                  Aktuálna ponuka
                </p>
                <h2 className="text-3xl font-bold text-slate-900">Najnovšie vozidlá</h2>
              </div>
              <Link
                href="/vehicles"
                className="hidden md:flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700"
              >
                Zobraziť všetky
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button asChild variant="outline">
                <Link href="/vehicles">Zobraziť všetky vozidlá</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-2">
              Naše výhody
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Prečo nakupovať u nás?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="flex items-center justify-center w-14 h-14 bg-orange-100 rounded-2xl mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Nenašli ste, čo hľadáte?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Kontaktujte nás a naši odborníci vám pomôžu nájsť vozidlo presne podľa vašich požiadaviek.
          </p>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/contact">Napíšte nám</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
