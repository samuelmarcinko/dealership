import React from 'react'
import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/public/ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte nás. Sme tu pre vás od pondelka do piatku. Radi odpovieme na všetky vaše otázky.',
}

const contactInfo = [
  { icon: Phone, label: 'Telefón', value: '+421 900 000 000' },
  { icon: Mail, label: 'Email', value: 'info@autobazar.sk' },
  { icon: MapPin, label: 'Adresa', value: 'Hlavná 1, 010 01 Žilina' },
  { icon: Clock, label: 'Otváracie hodiny', value: 'Po–Pia: 9:00–17:00\nSo: 9:00–13:00' },
]

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-slate-300 text-lg">
            Máte otázku? Sme tu pre vás. Neváhajte nás kontaktovať.
          </p>
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
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg shrink-0">
                    <item.icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">{item.label}</p>
                    <p className="text-slate-900 whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-8 bg-slate-100 rounded-xl h-48 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Mapa – Google Maps embed</p>
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
