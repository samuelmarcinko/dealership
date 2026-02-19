import React from 'react'
import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/public/ContactForm'
import { getTenantBranding } from '@/lib/tenant'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte nás. Sme tu pre vás od pondelka do piatku.',
}

export default async function ContactPage() {
  const branding = await getTenantBranding()

  const heroTitle = branding.contactHeroTitle ?? 'Kontakt'
  const heroSubtitle = branding.contactHeroSubtitle ?? 'Máte otázku? Sme tu pre vás. Neváhajte nás kontaktovať.'
  const hours = branding.contactHours ?? 'Po–Pia: 9:00–17:00\nSo: 9:00–13:00'
  const mapUrl = branding.contactMapUrl
  const phone = branding.contactPhone ?? '+421 900 000 000'
  const email = branding.contactEmail ?? 'info@autobazar.sk'
  const address = branding.contactAddress ?? 'Hlavná 1, 010 01 Žilina'

  const contactInfo = [
    { icon: Phone, label: 'Telefón', value: phone },
    { icon: Mail, label: 'Email', value: email },
    { icon: MapPin, label: 'Adresa', value: address },
    { icon: Clock, label: 'Otváracie hodiny', value: hours },
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-slate-300 text-lg">{heroSubtitle}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Kontaktné údaje</h2>
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">{item.label}</p>
                    <p className="text-slate-900 whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mt-8">
              {mapUrl ? (
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                />
              ) : (
                <div className="bg-slate-100 rounded-xl h-48 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Mapa – Google Maps embed</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Napíšte nám</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
