import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | AutoBazar',
    default: 'AutoBazar – Kvalitné ojazdené vozidlá',
  },
  description: 'Profesionálny predaj ojazdených vozidiel. Overené vozidlá, férové ceny, skvelý servis.',
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
