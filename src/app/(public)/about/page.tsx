import React from 'react'
import type { Metadata } from 'next'
import { Shield, Award, Users, MapPin, Star, Heart, Clock, CheckCircle, Zap, Car, MapPin as MapPinIcon, Phone, Mail, Wrench, Headphones, TrendingDown } from 'lucide-react'
import { getTenantBranding } from '@/lib/tenant'
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

const defaultStory = `<p>AutoBazar vznikol pred viac ako 10 rokmi s jednoduchým cieľom: poskytovať zákazníkom spoľahlivé ojazdené vozidlá za férové ceny, s plnou transparentnosťou a odborným poradenstvom.</p><p>Za roky pôsobenia sme predali stovky vozidiel spokojným zákazníkom. Každé auto, ktoré ponúkame, prešlo dôkladnou technickou kontrolou a má kompletnú servisnú históriu. Neveríme na skryté chyby ani skryté poplatky.</p><p>Náš tím tvorí skupina nadšencov do automobilov s odbornou znalosťou trhu. Sme tu nie len pre predaj, ale aj pre poradenstvo, financovanie a servis po kúpe.</p>`

export default async function AboutPage() {
  const branding = await getTenantBranding()

  const heroTitle = branding.aboutHeroTitle ?? 'O nás'
  const heroSubtitle =
    branding.aboutHeroSubtitle ??
    'Sme profesionálny autobazár s dlhoročnou tradíciou. Naším cieľom je spojiť zákazníkov s vozidlami, ktoré im sadnú, za transparentné a férové ceny.'
  const story = branding.aboutStory ?? defaultStory
  const teamText =
    branding.aboutTeamText ??
    'Tím skúsených odborníkov, ktorí sú vám vždy k dispozícii pre poradenstvo a pomoc pri výbere správneho vozidla.'

  const values = [
    {
      Icon: iconFromName(branding.aboutValue1Icon ?? 'shield'),
      title: branding.aboutValue1Title ?? 'Dôveryhodnosť',
      desc: branding.aboutValue1Desc ?? 'Každé vozidlo prechádza dôkladnou technickou kontrolou.',
    },
    {
      Icon: iconFromName(branding.aboutValue2Icon ?? 'award'),
      title: branding.aboutValue2Title ?? 'Kvalita',
      desc: branding.aboutValue2Desc ?? 'Ponúkame len vozidlá vo výbornom technickom stave.',
    },
    {
      Icon: iconFromName(branding.aboutValue3Icon ?? 'users'),
      title: branding.aboutValue3Title ?? 'Zákaznícky servis',
      desc: branding.aboutValue3Desc ?? 'Naši odborníci sú vám vždy k dispozícii.',
    },
    {
      Icon: iconFromName(branding.aboutValue4Icon ?? 'map_pin'),
      title: branding.aboutValue4Title ?? 'Miestny predajca',
      desc: branding.aboutValue4Desc ?? 'Sme tu pre vás osobne, nie len online.',
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-slate-300 text-lg max-w-2xl">{heroSubtitle}</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Náš príbeh</h2>
            <div
              className="prose prose-slate max-w-none text-slate-600 space-y-4"
              dangerouslySetInnerHTML={{ __html: story }}
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 text-center">Naše hodnoty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val) => (
              <div key={val.title} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4">
                  <val.Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{val.title}</h3>
                <p className="text-slate-500 text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Náš tím</h2>
          <p className="text-slate-500 max-w-xl mx-auto">{teamText}</p>
        </div>
      </section>
    </div>
  )
}
