import React from 'react'
import Link from 'next/link'
import { Car, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
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
              <span>Auto<span className="text-orange-500">Bazar</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Váš spoľahlivý partner pri kúpe ojazdených vozidiel.
              Férové ceny, overené vozidlá, profesionálny prístup.
            </p>
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
                  <Link
                    href={link.href}
                    className="hover:text-orange-400 transition-colors"
                  >
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
                <span>+421 900 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                <span>info@autobazar.sk</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Hlavná 1, 010 01 Žilina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AutoBazar. Všetky práva vyhradené.</p>
        </div>
      </div>
    </footer>
  )
}
