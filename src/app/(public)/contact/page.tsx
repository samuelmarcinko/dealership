import React from 'react'
import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ContactForm from '@/components/public/ContactForm'
import { getTenantBranding } from '@/lib/tenant'
import AnimateIn from '@/components/ui/AnimateIn'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte nás. Sme tu pre vás.',
}

export default async function ContactPage() {
  const branding = await getTenantBranding()

  const businessName = branding.businessName ?? 'AutoBazar'
  const heroTitle    = branding.contactHeroTitle    ?? 'Kontakt'
  const heroSubtitle = branding.contactHeroSubtitle ?? 'Máte otázku alebo záujem o vozidlo? Sme tu pre vás. Neváhajte nás kontaktovať.'
  const hours        = branding.contactHours        ?? 'Po–Pia: 9:00–17:00\nSo: 9:00–13:00'
  const mapUrl       = branding.contactMapUrl
  const phone        = branding.contactPhone        ?? '+421 900 000 000'
  const email        = branding.contactEmail        ?? 'info@autobazar.sk'
  const address      = branding.contactAddress      ?? 'Hlavná 1, 010 01 Žilina'

  const contactCards = [
    {
      icon: Phone,
      label: 'Telefón',
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
      cta: 'Zavolať',
    },
    {
      icon: Mail,
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
      cta: 'Napísať',
    },
    {
      icon: MapPin,
      label: 'Adresa',
      value: address,
      href: undefined,
      cta: undefined,
    },
    {
      icon: Clock,
      label: 'Otváracie hodiny',
      value: hours,
      href: undefined,
      cta: undefined,
    },
  ]

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

      {/* ── 2. Info cards ── */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card, i) => (
              <AnimateIn key={card.label} from="scale" delay={i * 80}>
                <div className="h-full bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-slate-800 font-medium leading-snug whitespace-pre-line text-sm">{card.value}</p>
                  {card.href && card.cta && (
                    <a
                      href={card.href}
                      className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary hover:underline"
                    >
                      {card.cta}
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Form + Map ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Form */}
            <AnimateIn from="left">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
                Správa
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Napíšte nám</h2>
              <p className="text-slate-500 mb-8">
                Odpovedáme zvyčajne do 24 hodín v pracovné dni.
              </p>
              <ContactForm />
            </AnimateIn>

            {/* Map */}
            <AnimateIn from="right">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
                Kde nás nájdete
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Navštívte nás</h2>
              <p className="text-slate-500 mb-6">{address}</p>
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                {mapUrl ? (
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="380"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="h-[380px] bg-slate-50 flex flex-col items-center justify-center gap-3">
                    <MapPin className="h-8 w-8 text-slate-300" />
                    <p className="text-slate-400 text-sm">Pridajte URL mapy v nastaveniach</p>
                  </div>
                )}
              </div>
            </AnimateIn>

          </div>
        </div>
      </section>

      {/* ── 4. CTA ── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <AnimateIn from="bottom" className="text-center max-w-2xl mx-auto">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-5 h-px bg-primary inline-block" />
              Sme tu pre vás
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prezerať naše vozidlá</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Prezrite si našu aktuálnu ponuku vozidiel a nájdite to, čo hľadáte.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/vehicles">
                Zobraziť vozidlá
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimateIn>
        </div>
      </section>

    </div>
  )
}
