/**
 * Vzorové zmluvy pre autobazár.
 *
 * Slúžia ako východiskový obsah — klient si ich v admine upraví, prípadne
 * nahradí vlastnými cez „Načítať z Wordu“.
 *
 * Spustenie na VPS:
 *   docker compose exec dealership node prisma/seed-documents.js
 *
 * Skript je idempotentný — šablónu s rovnakým názvom preskočí, takže
 * neprepíše úpravy, ktoré si klient urobil.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────
// 1. Zmluva o sprostredkovaní predaja
// ─────────────────────────────────────────────────────────────────────────

const SPROSTREDKOVATELSKA = `
<h1>Zmluva o sprostredkovaní predaja motorového vozidla</h1>
<p style="text-align: center">uzavretá podľa § 774 a nasl. zákona č. 40/1964 Zb. Občiansky zákonník v znení neskorších predpisov</p>

<h3>Sprostredkovateľ</h3>
<p>{predajca_nazov}, {predajca_adresa}<br>IČO: {predajca_ico} &nbsp;&nbsp; DIČ: {predajca_dic} &nbsp;&nbsp; IČ DPH: {predajca_ic_dph}<br>telefón: {predajca_telefon} &nbsp;&nbsp; e-mail: {predajca_email}<br>(ďalej len „sprostredkovateľ“)</p>

<h3>Záujemca</h3>
<p>{klient_nazov}<br>bydlisko: {klient_adresa}<br>dátum narodenia: {klient_datum_narodenia} &nbsp;&nbsp; rodné číslo: {rodne_cislo}<br>číslo OP: {klient_op} &nbsp;&nbsp; telefón: {klient_telefon}<br>číslo účtu (IBAN): {klient_ucet}<br>(ďalej len „záujemca“)</p>

<h2>I. Predmet zmluvy</h2>
<ol>
<li>Sprostredkovateľ sa zaväzuje, že bude vyvíjať činnosť smerujúcu k tomu, aby záujemca mal príležitosť uzavrieť kúpnu zmluvu s treťou osobou na predaj predmetu sprostredkovania, ktorého výlučným vlastníkom, prípadne bezpodielovým spoluvlastníkom, je záujemca.</li>
<li>Predmetom sprostredkovania je motorové vozidlo:</li>
</ol>

<table>
<tbody>
<tr><td><strong>Značka a model</strong></td><td>{vozidlo_znacka} {vozidlo_model} {vozidlo_variant}</td></tr>
<tr><td><strong>Rok výroby</strong></td><td>{vozidlo_rok}</td></tr>
<tr><td><strong>Dátum prvej registrácie</strong></td><td>{vozidlo_prva_registracia}</td></tr>
<tr><td><strong>VIN / číslo karosérie</strong></td><td>{vozidlo_vin}</td></tr>
<tr><td><strong>Evidenčné číslo</strong></td><td>{vozidlo_ecv}</td></tr>
<tr><td><strong>Číslo technického preukazu</strong></td><td>{vozidlo_cislo_tp}</td></tr>
<tr><td><strong>Stav tachometra podľa odometra</strong></td><td>{vozidlo_km}</td></tr>
<tr><td><strong>Stav tachometra podľa vyhlásenia majiteľa</strong></td><td>{vozidlo_km_vyhlasenie}</td></tr>
<tr><td><strong>Farba</strong></td><td>{vozidlo_farba}</td></tr>
<tr><td><strong>Palivo / prevodovka</strong></td><td>{vozidlo_palivo} / {vozidlo_prevodovka}</td></tr>
<tr><td><strong>Známe závady</strong></td><td>{vozidlo_zavady}</td></tr>
</tbody>
</table>

<ol start="3">
<li>Záujemca žiada, aby vozidlo bolo odpredané najmenej za cenu <strong>{min_cena} €</strong>, slovom {min_cena_slovom}. Záujemca sa zaväzuje súčasne s podpisom tejto zmluvy podpísať návrh budúcej kúpnej zmluvy s touto cenovou podmienkou.</li>
<li>Vozidlo zostáva vlastníctvom záujemcu až do uzavretia kúpnej zmluvy o predaji vozidla s treťou osobou.</li>
</ol>

<h2>II. Práva a povinnosti zmluvných strán</h2>
<ol>
<li>Záujemca sa zaväzuje poskytnúť sprostredkovateľovi všetky doklady nevyhnutné na splnenie účelu tejto zmluvy (technický preukaz, osvedčenie o evidencii, doklad o poistení, osvedčenie o STK a EK, splnomocnenie).</li>
<li>Záujemca sa zaväzuje poskytnúť sprostredkovateľovi úplné a presné informácie o predmete sprostredkovania, najmä ho upozorniť na všetky právne, technické a iné vady a nedostatky vozidla.</li>
<li>Záujemca zodpovedá za správnosť údaja o stave odometra uvedeného v čl. I tejto zmluvy. V prípade, že sa po predaji preukáže nezhoda skutočného počtu najazdených kilometrov s údajom uvedeným pri podpise tejto zmluvy, záujemca sa zaväzuje vrátiť kupujúcemu plnú kúpnu cenu do 14 dní odo dňa, keď bol na túto skutočnosť písomne upozornený.</li>
<li>Záujemca vyhlasuje, že si je vedomý právnych následkov zatajenia skrytých vád a poškodení vozidla. Je si vedomý, že nepravdivé údaje o vadách vozidla môžu mať za následok neplatnosť kúpnej zmluvy, odstúpenie od zmluvy, prípadne zľavu z ceny vozidla.</li>
<li>Záujemca touto zmluvou splnomocňuje sprostredkovateľa na uzavretie a podpis kúpnej zmluvy o predaji vozidla uvedeného v čl. I vo svojom mene.</li>
<li>Záujemca touto zmluvou splnomocňuje sprostredkovateľa na prevzatie kúpnej ceny od kupujúceho. Sprostredkovateľ je povinný odovzdať kúpnu cenu zníženú o dohodnutú odmenu a náklady podľa čl. III na účet záujemcu uvedený v záhlaví tejto zmluvy, a to najneskôr do siedmich dní odo dňa obdržania platby od kupujúceho. V prípade predaja cez leasingovú spoločnosť najneskôr do štrnástich dní od uzavretia kúpnej zmluvy.</li>
<li>Sprostredkovateľ sa zaväzuje bez zbytočného odkladu oznámiť záujemcovi okolnosti dôležité pre jeho rozhodovanie o uzavretí kúpnej zmluvy.</li>
<li>Sprostredkovateľ neručí za splnenie záväzkov tretích osôb, s ktorými sprostredkoval uzavretie kúpnej zmluvy.</li>
<li>Podpisom tejto zmluvy obidvomi stranami sa súčasne potvrdzuje, že záujemca odovzdal predmetné vozidlo sprostredkovateľovi. Sprostredkovateľ potvrdzuje, že spolu s vozidlom prevzal aj doklady a príslušenstvo, ktoré sú uvedené v preberacom protokole.</li>
<li>Sprostredkovateľ nezodpovedá za škody, ktoré vzniknú na vozidle počas jeho parkovania v priestoroch sprostredkovateľa alebo počas skúšobnej jazdy, a to najmä za škody spôsobené prírodným živlom, vandalizmom, požiarom alebo obdobnou udalosťou. Sprostredkovateľ zodpovedá len za škody, ktoré sú kryté poistením autobazára.</li>
<li>Záujemca vyhlasuje, že na sprostredkovanie predaja vozidla a na jeho predaj má výslovný súhlas manžela, resp. manželky, ak je vozidlo v bezpodielovom spoluvlastníctve manželov.</li>
</ol>

<h2>III. Odmena sprostredkovateľa, termíny</h2>
<ol>
<li>Sprostredkovateľovi vzniká nárok na odmenu, ak je na základe jeho činnosti uzavretá kúpna zmluva s treťou osobou.</li>
<li>Zmluvné strany sa dohodli na odmene vo výške <strong>{provizia} €</strong> vrátane DPH.</li>
<li>Odmena je splatná pri vysporiadaní kúpnej ceny spôsobom uvedeným v čl. II ods. 6 tejto zmluvy.</li>
<li>V dohodnutej odmene nie sú zahrnuté náklady na prípravu vozidla na predaj, najmä umytie vozidla, hĺbkové čistenie a tepovanie, tankovanie a doplnenie prevádzkových kvapalín. Tieto náklady budú uvedené samostatne vo vyúčtovaní za sprostredkovanie predaja.</li>
<li>Sprostredkovateľovi vzniká nárok účtovať stojné vo výške <strong>{stojne_den} €</strong> za každý deň státia vozidla. V tomto poplatku sú zahrnuté všetky úkony spojené s bežnou údržbou vozidla.</li>
<li>Táto zmluva sa uzatvára na dobu neurčitú, najmenej však na {doba_trvania} dní odo dňa jej účinnosti.</li>
<li>Záujemca môže trvanie zmluvy ukončiť aj pred uplynutím dohodnutej doby s tým, že uhradí sprostredkovateľovi odstupné vo výške <strong>{odstupne} €</strong>.</li>
<li>Ak nedôjde k realizácii predaja z dôvodov na strane záujemcu, uhradí záujemca sprostredkovateľovi jednorazový servisný poplatok vo výške <strong>{servisny_poplatok} €</strong> za prípravu vozidla na predaj, jeho inzerciu a prezentáciu. Tento poplatok neobsahuje náklady podľa ods. 4 tohto článku.</li>
<li>Záujemca nemôže zrušiť túto zmluvu, ak už došlo k realizácii predaja, alebo ak za vozidlo už bola zložená záloha a očakáva sa poukázanie kúpnej ceny.</li>
<li>Ak kupujúci odstúpi od kúpnej zmluvy, alebo bude kúpna zmluva zrušená v dôsledku nesprávnych skutočností, nezodpovedajúceho počtu najazdených kilometrov alebo nepravdivých informácií o technickom a právnom stave vozidla zo strany záujemcu, odmena sprostredkovateľa sa nevracia.</li>
</ol>

<h2>IV. Ochrana osobných údajov</h2>
<ol>
<li>Záujemca berie na vedomie, že osobné údaje uvedené v tejto zmluve môžu byť predmetom spracúvania sprostredkovateľom po nevyhnutnú zákonnú dobu, a to na účely vedenia účtovníctva podľa zákona č. 431/2002 Z. z. o účtovníctve v znení neskorších predpisov.</li>
<li>Bližšie informácie o spracúvaní osobných údajov sú uvedené v samostatnom dokumente „Informačná povinnosť“, ktorý tvorí prílohu tejto zmluvy.</li>
</ol>

<h2>V. Záverečné ustanovenia</h2>
<ol>
<li>Táto zmluva nadobúda platnosť a účinnosť dňom jej podpisu obidvomi zmluvnými stranami.</li>
<li>Zmluvu je možné meniť len na základe vzájomnej dohody zmluvných strán vo forme písomných dodatkov.</li>
<li>Vzťahy neupravené touto zmluvou sa riadia príslušnými ustanoveniami Občianskeho zákonníka.</li>
<li>Zmluva je vyhotovená v dvoch rovnopisoch, po jednom pre každú zmluvnú stranu.</li>
<li>Zmluvné strany po prečítaní tejto zmluvy vyhlasujú, že súhlasia s jej obsahom, že bola spísaná na základe pravdivých údajov a ich slobodnej vôle, a že nebola uzavretá za nápadne nevýhodných podmienok ani v tiesni. Na dôkaz toho pripájajú svoje podpisy.</li>
</ol>

<p>V {miesto}, dňa {datum_dnes}</p>

<table>
<tbody>
<tr>
<td style="text-align: center"><br><br>.................................................<br>sprostredkovateľ</td>
<td style="text-align: center"><br><br>.................................................<br>záujemca</td>
</tr>
</tbody>
</table>
`.trim()

const SPROSTREDKOVATELSKA_FIELDS = [
  { key: 'rodne_cislo', label: 'Rodné číslo záujemcu', type: 'text', defaultValue: '' },
  { key: 'min_cena', label: 'Minimálna predajná cena (€)', type: 'number', defaultValue: '' },
  { key: 'min_cena_slovom', label: 'Minimálna predajná cena slovom', type: 'text', defaultValue: '' },
  { key: 'provizia', label: 'Odmena sprostredkovateľa (€ s DPH)', type: 'number', defaultValue: '50' },
  { key: 'stojne_den', label: 'Stojné za deň (€)', type: 'number', defaultValue: '0' },
  { key: 'doba_trvania', label: 'Minimálna doba trvania (dni)', type: 'number', defaultValue: '30' },
  { key: 'odstupne', label: 'Odstupné pri predčasnom ukončení (€)', type: 'number', defaultValue: '100' },
  { key: 'servisny_poplatok', label: 'Servisný poplatok pri nerealizovaní predaja (€)', type: 'number', defaultValue: '300' },
]

// ─────────────────────────────────────────────────────────────────────────
// 2. Preberací protokol
// ─────────────────────────────────────────────────────────────────────────

const PROTOKOL = `
<h1>Preberací protokol</h1>
<p style="text-align: center">k zmluve o sprostredkovaní predaja motorového vozidla zo dňa {datum_dnes}</p>

<p><strong>Vozidlo:</strong> {vozidlo_znacka} {vozidlo_model} {vozidlo_variant}, VIN {vozidlo_vin}, EČV {vozidlo_ecv}<br>
<strong>Záujemca:</strong> {klient_nazov}, {klient_adresa}<br>
<strong>Sprostredkovateľ:</strong> {predajca_nazov}, {predajca_adresa}</p>

<p>Sprostredkovateľ potvrdzuje, že spolu s vozidlom prevzal nasledujúce doklady a príslušenstvo:</p>

<table>
<tbody>
<tr><td><strong>Technický preukaz – kópia</strong></td><td>{protokol_tp}</td><td><strong>Osvedčenie o EK</strong></td><td>{protokol_ek_osvedcenie}</td></tr>
<tr><td><strong>Osvedčenie o evidencii časť I – originál</strong></td><td>{protokol_osvedcenie_i}</td><td><strong>Protokol o EK</strong></td><td>{protokol_ek_protokol}</td></tr>
<tr><td><strong>Návody a manuály k vozidlu</strong></td><td>{protokol_navody}</td><td><strong>Počet kľúčov</strong></td><td>{pocet_klucov}</td></tr>
<tr><td><strong>Splnomocnenie</strong></td><td>{protokol_splnomocnenie}</td><td><strong>Počet ovládačov k alarmu</strong></td><td>{pocet_ovladacov}</td></tr>
<tr><td><strong>Osvedčenie o STK – originál</strong></td><td>{protokol_stk_osvedcenie}</td><td><strong>Zdvihák</strong></td><td>{protokol_zdvihak}</td></tr>
<tr><td><strong>Protokol o STK</strong></td><td>{protokol_stk_protokol}</td><td><strong>Osvedčenie k autofóliám</strong></td><td>{protokol_autofolie}</td></tr>
<tr><td><strong>PZP – zelená karta</strong></td><td>{protokol_pzp}</td><td><strong>Kľúč na kolesá</strong></td><td>{protokol_kluc_kolesa}</td></tr>
<tr><td><strong>Doklad o zaplatení</strong></td><td>{protokol_doklad_platba}</td><td><strong>Servisná kniha</strong></td><td>{protokol_servisna_kniha}</td></tr>
</tbody>
</table>

<p><strong>Stav tachometra pri prevzatí:</strong> {vozidlo_km} (podľa vyhlásenia majiteľa: {vozidlo_km_vyhlasenie})</p>

<h3>Poznámky ku stavu vozidla</h3>
<p>{stav_vozidla_poznamky}</p>

<p>V {miesto}, dňa {datum_dnes}</p>

<table>
<tbody>
<tr>
<td style="text-align: center"><br><br>.................................................<br>sprostredkovateľ</td>
<td style="text-align: center"><br><br>.................................................<br>záujemca – odovzdávajúci</td>
</tr>
</tbody>
</table>
`.trim()

const PROTOKOL_FIELDS = [
  { key: 'protokol_tp', label: 'Technický preukaz – kópia', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_osvedcenie_i', label: 'Osvedčenie o evidencii časť I – originál', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_navody', label: 'Návody a manuály k vozidlu', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_splnomocnenie', label: 'Splnomocnenie', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_stk_osvedcenie', label: 'Osvedčenie o STK – originál', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_stk_protokol', label: 'Protokol o STK', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_pzp', label: 'PZP – zelená karta', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_doklad_platba', label: 'Doklad o zaplatení', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_ek_osvedcenie', label: 'Osvedčenie o EK', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_ek_protokol', label: 'Protokol o EK', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'pocet_klucov', label: 'Počet kľúčov', type: 'number', defaultValue: '' },
  { key: 'pocet_ovladacov', label: 'Počet ovládačov k alarmu', type: 'number', defaultValue: '' },
  { key: 'protokol_zdvihak', label: 'Zdvihák', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_autofolie', label: 'Osvedčenie k autofóliám', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_kluc_kolesa', label: 'Kľúč na kolesá', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'protokol_servisna_kniha', label: 'Servisná kniha', type: 'checkbox', defaultValue: 'Nie' },
  { key: 'stav_vozidla_poznamky', label: 'Poznámky ku stavu vozidla', type: 'textarea', defaultValue: '' },
]

// ─────────────────────────────────────────────────────────────────────────
// 3. Informačná povinnosť (GDPR)
// ─────────────────────────────────────────────────────────────────────────

const GDPR = `
<h1>Informačná povinnosť</h1>
<p style="text-align: center">určená zákazníkom</p>

<p><strong>Titul, meno, priezvisko:</strong> {klient_cele_meno}<br>
<strong>Adresa:</strong> {klient_adresa}<br>
(ďalej ako „dotknutá osoba“)</p>

<p style="text-align: justify">Vyššie uvedená dotknutá osoba svojím podpisom potvrdzuje, že bola riadne oboznámená o spracúvaní svojich osobných údajov prevádzkovateľom: {predajca_nazov}, {predajca_adresa}, IČO: {predajca_ico} (ďalej len „prevádzkovateľ“), a na základe tejto informačnej povinnosti porozumela, že spracúvanie jej osobných údajov v rozsahu nevyhnutnom na plnenie zmluvy uzatvorenej medzi prevádzkovateľom a dotknutou osobou je považované za zákonné, nakoľko prevádzkovateľ spracúva osobné údaje na právnom základe, ktorým je čl. 6 ods. 1 písm. b) nariadenia Európskeho parlamentu a Rady (EÚ) č. 2016/679 o ochrane fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe takýchto údajov, ktorým sa zrušuje smernica 95/46/ES (ďalej len „Nariadenie GDPR“) – plnenie zmluvy a predzmluvné vzťahy.</p>

<p style="text-align: justify">Dotknutá osoba svoje osobné údaje prevádzkovateľovi dobrovoľne a sama poskytla, a to za účelom plnenia podmienok objednávky alebo zmluvy uzatvorenej medzi prevádzkovateľom a dotknutou osobou.</p>

<p style="text-align: justify">Túto informačnú povinnosť dotknutá osoba podpíše na adrese prevádzkovateľa osobne, alebo elektronicky a priloží k objednávke, ktorá je predmetom zmluvy, alebo objednávky medzi prevádzkovateľom a objednávateľom služieb prevádzkovateľa (dotknutou osobou) na e-mailovú adresu uvedenú pri ponuke ({predajca_email}).</p>

<p style="text-align: justify">Osobné údaje bude prevádzkovateľ spracúvať a uschovávať odo dňa zadania objednávky. Následne bude ďalšie spracovanie podliehať zákonu č. 395/2002 Z. z. o archívoch a registratúrach a o doplnení niektorých zákonov v znení neskorších predpisov.</p>

<p style="text-align: justify">V prípade, že nedôjde k realizácii sprostredkovania predaja, osobné údaje dotknutej osoby budú zlikvidované, ak ich ďalšie uchovávanie nevyžaduje osobitný právny predpis.</p>

<p>S úctou</p>

<p>V {miesto}, dňa {datum_dnes}</p>

<p style="text-align: right"><br>.................................................<br>podpis dotknutej osoby</p>
`.trim()

// ─────────────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    name: 'Zmluva o sprostredkovaní predaja',
    description: 'Podpisuje sa pri prevzatí vozidla do komisie',
    content: SPROSTREDKOVATELSKA,
    customFields: SPROSTREDKOVATELSKA_FIELDS,
    sortOrder: 0,
  },
  {
    name: 'Preberací protokol',
    description: 'Zoznam prevzatých dokladov a príslušenstva',
    content: PROTOKOL,
    customFields: PROTOKOL_FIELDS,
    sortOrder: 1,
  },
  {
    name: 'Informačná povinnosť (GDPR)',
    description: 'Poučenie o spracúvaní osobných údajov',
    content: GDPR,
    customFields: [],
    sortOrder: 2,
  },
]

async function main() {
  for (const tpl of TEMPLATES) {
    const existing = await prisma.documentTemplate.findFirst({ where: { name: tpl.name } })
    if (existing) {
      console.log(`preskakujem (už existuje): ${tpl.name}`)
      continue
    }
    await prisma.documentTemplate.create({ data: tpl })
    console.log(`vytvorené: ${tpl.name}`)
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
