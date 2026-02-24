import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Award, Headphones, TrendingDown, Star, Heart, Clock, CheckCircle, Zap, Car, Users, MapPin, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VehicleCard from '@/components/public/VehicleCard'
import { prisma } from '@/lib/prisma'
import { getTenantBranding, getTenantSettings } from '@/lib/tenant'
import type { PublicVehicle } from '@/types'
import type { LucideProps } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings()
  const seoTitle = settings['homepage_seo_title'] || settings['business_name'] || 'AutoBazar'
  const seoDescription = settings['homepage_seo_description'] || undefined
  const ogImageUrl = settings['homepage_seo_og_image'] || undefined

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

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

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  shield: Shield,
  award: Award,
  trending_down: TrendingDown,
  headphones: Headphones,
  star: Star,
  heart: Heart,
  clock: Clock,
  check: CheckCircle,
  zap: Zap,
  car: Car,
  users: Users,
  map_pin: MapPin,
  wrench: Wrench,
}

function iconFromName(name: string | undefined): React.ComponentType<LucideProps> {
  if (!name) return Shield
  return ICON_MAP[name] ?? Shield
}

export default async function HomePage() {
  const [vehicles, branding] = await Promise.all([
    getFeaturedVehicles(),
    getTenantBranding(),
  ])

  const heroBadge = branding.heroBadge ?? 'Profesionálny autobazar'
  const heroTitle = branding.heroTitle ?? 'Nájdite vozidlo'
  const heroTitleAccent = branding.heroTitleAccent ?? 'svojich snov'
  const heroSubtitle = branding.heroSubtitle ?? 'Ponúkame starostlivo vybrané ojazdené vozidlá za transparentné ceny. Každé auto prešlo technickou kontrolou a je pripravené na cestu.'
  const heroBtn1Text = branding.heroBtn1Text ?? 'Prezerať vozidlá'
  const heroBtn1Url = branding.heroBtn1Url ?? '/vehicles'
  const heroBtn2Text = branding.heroBtn2Text ?? 'Kontaktujte nás'
  const heroBtn2Url = branding.heroBtn2Url ?? '/contact'

  const stats = [
    { value: branding.stat1Value ?? '500+', label: branding.stat1Label ?? 'Predaných vozidiel' },
    { value: branding.stat2Value ?? '98%', label: branding.stat2Label ?? 'Spokojných zákazníkov' },
    { value: branding.stat3Value ?? '10+', label: branding.stat3Label ?? 'Rokov na trhu' },
    { value: branding.stat4Value ?? '24/7', label: branding.stat4Label ?? 'Online podpora' },
  ]

  const features = [
    {
      Icon: iconFromName(branding.feature1Icon ?? 'shield'),
      title: branding.feature1Title ?? 'Overené vozidlá',
      description: branding.feature1Desc ?? 'Každé vozidlo prechádza dôkladnou technickou kontrolou pred predajom.',
    },
    {
      Icon: iconFromName(branding.feature2Icon ?? 'award'),
      title: branding.feature2Title ?? 'Záruka kvality',
      description: branding.feature2Desc ?? 'Poskytujeme záruku na všetky predané vozidlá a odborné poradenstvo.',
    },
    {
      Icon: iconFromName(branding.feature3Icon ?? 'trending_down'),
      title: branding.feature3Title ?? 'Férové ceny',
      description: branding.feature3Desc ?? 'Transparentné ceny bez skrytých poplatkov. Čo vidíte, to zaplatíte.',
    },
    {
      Icon: iconFromName(branding.feature4Icon ?? 'headphones'),
      title: branding.feature4Title ?? 'Podpora zákazníkov',
      description: branding.feature4Desc ?? 'Náš tím je tu pre vás pred aj po kúpe vozidla. Vždy ochotní poradiť.',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {branding.heroBgImage ? (
          <Image
            src={branding.heroBgImage}
            alt="Hero pozadie"
            fill
            className="object-cover opacity-25"
            priority
          />
        ) : (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        )}
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
              {heroBadge}
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              {heroTitle}<br />
              <span className="text-primary">{heroTitleAccent}</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link href={heroBtn1Url}>
                  {heroBtn1Text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/60 text-white bg-transparent hover:bg-white hover:text-slate-900"
              >
                <Link href={heroBtn2Url}>{heroBtn2Text}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-extrabold">{stat.value}</div>
                <div className="text-white/75 text-sm mt-1">{stat.label}</div>
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
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
                  Aktuálna ponuka
                </p>
                <h2 className="text-3xl font-bold text-slate-900">Najnovšie vozidlá</h2>
              </div>
              <Link
                href="/vehicles"
                className="hidden md:flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity"
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
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
              Naše výhody
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Prečo nakupovať u nás?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4 bg-primary/10">
                  <feature.Icon className="h-7 w-7 text-primary" />
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
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/contact">Napíšte nám</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
