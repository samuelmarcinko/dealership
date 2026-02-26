import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield, Award, Users, MapPin, Star, Heart, Clock, CheckCircle,
  Zap, Car, Phone, Mail, Wrench, Headphones, TrendingDown, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTenantBranding } from '@/lib/tenant'
import AnimateIn from '@/components/ui/AnimateIn'
import type { LucideProps } from 'lucide-react'

export const metadata: Metadata = {
  title: 'O nás',
  description: 'Zistite viac o našom autobazáre.',
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  shield: Shield,
  award: Award,
  users: Users,
  map_pin: MapPin,
  star: Star,
  heart: Heart,
  clock: Clock,
  check: CheckCircle,
  zap: Zap,
  car: Car,
  phone: Phone,
  mail: Mail,
  wrench: Wrench,
  headphones: Headphones,
  trending_down: TrendingDown,
}

function iconFromName(name: string | undefined): React.ComponentType<LucideProps> {
  if (!name) return Shield
  return ICON_MAP[name] ?? Shield
}

const defaultStory = `<p>Náš autobazár vznikol pred viac ako 10 rokmi s jednoduchým cieľom — poskytovať zákazníkom spoľahlivé ojazdené vozidlá za férové ceny, s plnou transparentnosťou a odborným poradenstvom.</p><p>Za roky pôsobenia sme predali stovky vozidiel spokojným zákazníkom z celého Slovenska. Každé auto, ktoré ponúkame, prechádza dôkladnou technickou kontrolou a má kompletnú servisnú históriu. Neveríme na skryté chyby ani skryté poplatky.</p><p>Náš tím tvorí skupina nadšencov do automobilov s hlbokou odbornou znalosťou trhu. Sme tu nielen pre predaj, ale aj pre poradenstvo, financovanie a servis po kúpe.</p>`

const defaultTeamText = `Tím skúsených odborníkov, ktorí sú vám vždy k dispozícii pre poradenstvo a pomoc pri výbere správneho vozidla. Každý z nás má vášeň pre automobily a roky skúseností v odbore.`

export default async function AboutPage() {
  const branding = await getTenantBranding()

  const businessName = branding.businessName ?? 'AutoBazar'
  const heroTitle    = branding.aboutHeroTitle    ?? 'O nás'
  const heroSubtitle = branding.aboutHeroSubtitle ?? 'Sme profesionálny autobazár s dlhoročnou tradíciou. Naším cieľom je spojiť zákazníkov s vozidlami, ktoré im sadnú — za transparentné a férové ceny.'
  const story        = branding.aboutStory        ?? defaultStory
  const teamText     = branding.aboutTeamText     ?? defaultTeamText

  const stats = [
    { value: branding.stat1Value ?? '500+', label: branding.stat1Label ?? 'Predaných vozidiel' },
    { value: branding.stat2Value ?? '98%',  label: branding.stat2Label ?? 'Spokojných zákazníkov' },
    { value: branding.stat3Value ?? '10+',  label: branding.stat3Label ?? 'Rokov na trhu' },
    { value: branding.stat4Value ?? '24/7', label: branding.stat4Label ?? 'Online podpora' },
  ]

  const values = [
    {
      Icon: iconFromName(branding.aboutValue1Icon ?? 'shield'),
      title: branding.aboutValue1Title ?? 'Dôveryhodnosť',
      desc:  branding.aboutValue1Desc  ?? 'Každé vozidlo prechádza dôkladnou technickou kontrolou pred predajom.',
    },
    {
      Icon: iconFromName(branding.aboutValue2Icon ?? 'award'),
      title: branding.aboutValue2Title ?? 'Kvalita',
      desc:  branding.aboutValue2Desc  ?? 'Ponúkame len vozidlá vo výbornom technickom stave s plnou históriou.',
    },
    {
      Icon: iconFromName(branding.aboutValue3Icon ?? 'users'),
      title: branding.aboutValue3Title ?? 'Zákaznícky servis',
      desc:  branding.aboutValue3Desc  ?? 'Naši odborníci sú vám k dispozícii pred aj po kúpe vozidla.',
    },
    {
      Icon: iconFromName(branding.aboutValue4Icon ?? 'map_pin'),
      title: branding.aboutValue4Title ?? 'Miestny predajca',
      desc:  branding.aboutValue4Desc  ?? 'Sme tu pre vás osobne — nie len online. Navštívte nás.',
    },
  ]

  const phone = branding.contactPhone
  const email = branding.contactEmail

  return (
    <div className="bg-white">

      {/* ── 1. Hero ── */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Gradient accent */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <AnimateIn from="bottom">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-primary inline-block" />
              {businessName}
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              {heroTitle}
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ── 2. Príbeh + štatistiky ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: Stats grid */}
            <AnimateIn from="left">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                      i === 0
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-50 text-slate-900 border-slate-100'
                    }`}
                  >
                    <div className={`text-4xl font-extrabold mb-2 ${i === 0 ? 'text-white' : 'text-primary'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm font-medium ${i === 0 ? 'text-white/80' : 'text-slate-500'}`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimateIn>

            {/* Right: Story */}
            <AnimateIn from="right">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
                Náš príbeh
              </span>
              <div
                className="text-slate-600 leading-relaxed space-y-4 [&_p]:text-base [&_p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: story }}
              />
            </AnimateIn>

          </div>
        </div>
      </section>

      {/* ── 3. Hodnoty ── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimateIn from="bottom" className="text-center mb-14">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Naše hodnoty
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Čo nás definuje</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Tieto princípy sú základom každého rozhodnutia, ktoré robíme.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <AnimateIn key={val.title} from="scale" delay={i * 100} className="h-full">
                <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 shrink-0">
                    <val.Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{val.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{val.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Tím ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimateIn from="bottom" className="text-center mb-12">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                Náš tím
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ľudia za {businessName}</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                {teamText}
              </p>
            </AnimateIn>

            {/* Contact quick links */}
            {(phone || email) && (
              <AnimateIn from="bottom" delay={150}>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary transition-all duration-200 text-sm font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      {phone}
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary transition-all duration-200 text-sm font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      {email}
                    </a>
                  )}
                </div>
              </AnimateIn>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <AnimateIn from="bottom" className="text-center max-w-2xl mx-auto">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-5 h-px bg-primary inline-block" />
              Sme tu pre vás
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Poďme si pohovoriť</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Máte otázku alebo záujem o niektoré z našich vozidiel? Neváhajte nás kontaktovať.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/contact">
                  Kontaktovať nás
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white hover:text-slate-900">
                <Link href="/vehicles">Prezerať vozidlá</Link>
              </Button>
            </div>
          </AnimateIn>
        </div>
      </section>

    </div>
  )
}
