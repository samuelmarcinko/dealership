import React from 'react'
import Link from 'next/link'
import { Car, Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import type { TenantBranding } from '@/lib/tenant'

interface Props {
  branding?: TenantBranding
}

export default function Footer({ branding }: Props) {
  const name = branding?.businessName ?? 'AutoBazar'
  const phone = branding?.contactPhone ?? '+421 900 000 000'
  const email = branding?.contactEmail ?? 'info@autobazar.sk'
  const address = branding?.contactAddress ?? 'Hlavná 1, 010 01 Žilina'

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span>{name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Váš spoľahlivý partner pri kúpe ojazdených vozidiel.
              Férové ceny, overené vozidlá, profesionálny prístup.
            </p>
            {/* Social */}
            {(branding?.socialFacebook || branding?.socialInstagram) && (
              <div className="flex gap-3 mt-4">
                {branding.socialFacebook && (
                  <a
                    href={branding.socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {branding.socialInstagram && (
                  <a
                    href={branding.socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigácia</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Domov' },
                { href: '/vehicles', label: 'Vozidlá' },
                { href: '/about', label: 'O nás' },
                { href: '/contact', label: 'Kontakt' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-orange-400 transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-orange-400 transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {name}. Všetky práva vyhradené.</p>
        </div>
      </div>
    </footer>
  )
}
