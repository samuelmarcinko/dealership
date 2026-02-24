import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Award, Headphones, TrendingDown, Star, Heart, Clock, CheckCircle, Zap, Car, Users, MapPin, Wrench, Search, Phone, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VehicleCard from '@/components/public/VehicleCard'
import AnimateIn from '@/components/ui/AnimateIn'
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

async function getPopularMakes() {
  return prisma.vehicle.groupBy({
    by: ['make'],
    where: { status: 'AVAILABLE' },
    _count: { make: true },
    orderBy: { _count: { make: 'desc' } },
    take: 10,
  })
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
  const [vehicles, branding, popularMakes] = await Promise.all([
    getFeaturedVehicles(),
    getTenantBranding(),
    getPopularMakes(),
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

  const howItWorks = [
    {
      num: '01',
      Icon: Search,
      title: 'Prezrite si ponuku',
      desc: 'Prehliadajte naše vozidlá podľa značky, ceny alebo parametrov a nájdite to pravé.',
    },
    {
      num: '02',
      Icon: Phone,
      title: 'Kontaktujte nás',
      desc: 'Zavolajte nám alebo vyplňte formulár. Naši odborníci vám radi poradia a dohodnú termín.',
    },
    {
      num: '03',
      Icon: KeyRound,
      title: 'Prevzite svoje auto',
      desc: 'Po záverečnej kontrole a vybavení dokumentov si odjazdíte s novým vozidlom.',
    },
  ]

  return (
    <>
      {/* ── Hero ── */}
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
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        )}
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl">
            <p className="animate-hero-1 text-primary font-semibold text-sm uppercase tracking-widest mb-4 inline-flex items-center gap-2">
              <span className="w-5 h-px bg-primary inline-block" />
              {heroBadge}
            </p>
            <h1 className="animate-hero-2 text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              {heroTitle}<br />
              <span className="text-primary">{heroTitleAccent}</span>
            </h1>
            <p className="animate-hero-3 text-slate-300 text-lg md:text-xl mb-8 max-w-xl">
              {heroSubtitle}
            </p>
            <div className="animate-hero-4 flex flex-wrap gap-4">
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
            <p className="animate-hero-5 mt-8 text-slate-400 text-sm flex flex-wrap gap-x-4 gap-y-1">
              <span>✓ Každé auto overené</span>
              <span>✓ Transparentné ceny</span>
              <span>✓ Odborné poradenstvo</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-white/20 text-center">
            {stats.map((stat, i) => (
              <AnimateIn key={stat.label} delay={i * 100} className="px-6 py-4 md:py-2">
                <div className="text-3xl md:text-4xl font-extrabold">{stat.value}</div>
                <div className="text-white/75 text-sm mt-1">{stat.label}</div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ako to funguje ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimateIn from="bottom" className="text-center mb-14">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Jednoduchý proces
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Ako to funguje?</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Kúpa auta ešte nebola tak jednoduchá. Tri kroky k vášmu novému vozidlu.
            </p>
          </AnimateIn>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Desktop dashed connector */}
            <div
              className="hidden md:block absolute top-10 left-[calc(33.333%+2rem)] right-[calc(33.333%+2rem)] border-t-2 border-dashed border-slate-200 pointer-events-none"
              aria-hidden
            />

            {howItWorks.map((step, i) => (
              <AnimateIn key={step.num} from="bottom" delay={i * 150}>
                <div className="relative text-center px-8 py-6">
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 text-[7rem] font-black text-slate-100 select-none leading-none pointer-events-none"
                    aria-hidden
                  >
                    {step.num}
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <step.Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-xl mb-3">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured vehicles ── */}
      {vehicles.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <AnimateIn from="bottom" className="mb-10">
              <div className="flex items-end justify-between">
                <div>
                  <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    Aktuálna ponuka
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Najnovšie vozidlá</h2>
                  <p className="text-slate-500 mt-2 text-sm">Čerstvé prírastky do našej ponuky, pripravené na odovzdanie.</p>
                </div>
                <Link
                  href="/vehicles"
                  className="hidden md:flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity shrink-0"
                >
                  Zobraziť všetky
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimateIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, i) => (
                <AnimateIn key={vehicle.id} delay={i * 80} from="bottom">
                  <VehicleCard vehicle={vehicle} />
                </AnimateIn>
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

      {/* ── Prečo my ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimateIn from="bottom" className="text-center mb-14">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Naše výhody
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Prečo nakupovať u nás?</h2>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <AnimateIn key={feature.title} from="scale" delay={i * 100}>
                <div className="rounded-2xl border border-slate-200 p-7 text-center hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                    <feature.Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Populárne značky ── */}
      {popularMakes.length >= 2 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <AnimateIn from="bottom">
              <div className="text-center mb-10">
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Podľa značky
                </span>
                <h2 className="text-3xl font-bold text-slate-900">Populárne značky</h2>
                <p className="text-slate-500 mt-2 text-sm">Prehliadajte vozidlá podľa obľúbených značiek.</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {popularMakes.map((item) => (
                  <Link
                    key={item.make}
                    href={`/vehicles?make=${encodeURIComponent(item.make)}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 text-sm font-medium text-slate-700"
                  >
                    {item.make}
                    <span className="text-xs text-slate-400 font-normal">{item._count.make}</span>
                  </Link>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateIn from="left">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-px bg-primary inline-block" />
                Sme tu pre vás
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nenašli ste, čo hľadáte?</h2>
              <p className="text-slate-300 mb-8 max-w-md">
                Kontaktujte nás a naši odborníci vám pomôžu nájsť vozidlo presne podľa vašich požiadaviek.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/contact">
                  Napíšte nám
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </AnimateIn>

            <AnimateIn from="right">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>
    </>
  )
}
