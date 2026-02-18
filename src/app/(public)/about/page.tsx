import React from 'react'
import type { Metadata } from 'next'
import { Shield, Award, Users, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'O nás',
  description: 'Zistite viac o našom autobazáre. Viac ako 10 rokov skúseností na trhu s ojazdenými vozidlami.',
}

const values = [
  { icon: Shield, title: 'Dôveryhodnosť', desc: 'Každé vozidlo prechádza dôkladnou technickou kontrolou.' },
  { icon: Award, title: 'Kvalita', desc: 'Ponúkame len vozidlá vo výbornom technickom stave.' },
  { icon: Users, title: 'Zákaznícky servis', desc: 'Naši odborníci sú vám vždy k dispozícii.' },
  { icon: MapPin, title: 'Miestny predajca', desc: 'Sme tu pre vás osobne, nie len online.' },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">O nás</h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            Sme profesionálny autobazár s dlhoročnou tradíciou. Naším cieľom je spojiť zákazníkov
            s vozidlami, ktoré im sadnú, za transparentné a férové ceny.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Náš príbeh</h2>
            <div className="prose prose-slate max-w-none space-y-4 text-slate-600">
              <p>
                AutoBazar vznikol pred viac ako 10 rokmi s jednoduchým cieľom: poskytovať zákazníkom
                spoľahlivé ojazdené vozidlá za férové ceny, s plnou transparentnosťou a odborným
                poradenstvom.
              </p>
              <p>
                Za roky pôsobenia sme predali stovky vozidiel spokojným zákazníkom. Každé auto,
                ktoré ponúkame, prešlo dôkladnou technickou kontrolou a má kompletnú servisnú históriu.
                Neveríme na skryté chyby ani skryté poplatky.
              </p>
              <p>
                Náš tím tvorí skupina nadšencov do automobilov s odbornou znalosťou trhu. Sme tu
                nie len pre predaj, ale aj pre poradenstvo, financovanie a servis po kúpe.
              </p>
            </div>
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
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4">
                  <val.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{val.title}</h3>
                <p className="text-slate-500 text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Náš tím</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Tím skúsených odborníkov, ktorí sú vám vždy k dispozícii pre poradenstvo a pomoc
            pri výbere správneho vozidla.
          </p>
        </div>
      </section>
    </div>
  )
}
