'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Car, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TenantBranding } from '@/lib/tenant'

const navLinks = [
  { href: '/', label: 'Domov', exact: true },
  { href: '/vehicles', label: 'Vozidlá' },
  { href: '/about', label: 'O nás' },
  { href: '/contact', label: 'Kontakt' },
]

interface Props {
  branding?: TenantBranding
}

export default function Navbar({ branding }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const name = branding?.businessName ?? 'AutoBazar'

  function isActive(link: { href: string; exact?: boolean }) {
    if (link.exact) return pathname === link.href
    return pathname === link.href || pathname.startsWith(link.href + '/')
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/5 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {branding?.logoUrl ? (
              <div className="relative h-10 w-28">
                <Image
                  src={branding.logoUrl}
                  alt={name}
                  fill
                  className="object-contain object-left"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-md">
                <Car className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-white font-bold text-xl tracking-tight">{name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive(link)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: phone */}
          {branding?.contactPhone && (
            <div className="hidden md:flex items-center shrink-0 ml-auto">
              <a
                href={`tel:${branding.contactPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>{branding.contactPhone}</span>
              </a>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white p-2 ml-auto transition-colors rounded-lg hover:bg-white/5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-white/5">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive(link)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            {branding?.contactPhone && (
              <a
                href={`tel:${branding.contactPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                {branding.contactPhone}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
