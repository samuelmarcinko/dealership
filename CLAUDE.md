# Dealership — Project Context pre Claude Code

## Čo je táto appka

Multi-tenant SaaS platforma pre autobazáre. Jeden kód, každý zákazník (tenant) má vlastnú inštanciu s vlastnou DB, vlastnými dátami a vlastnou doménou.

**Demo tenant:** demobazar.webshine.sk

---

## Tech Stack

| Vrstva | Technológia |
|--------|-------------|
| Frontend + Backend | Next.js 15 App Router + TypeScript |
| Databáza | PostgreSQL + Prisma ORM |
| Štýlovanie | Tailwind CSS + shadcn/ui komponenty |
| Kontajnerizácia | Docker (standalone Next.js output) |
| Reverse proxy | Traefik + Let's Encrypt TLS |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions |

---

## Multi-tenant architektúra

### Princíp: 1 image, N containerov

```
Docker image (GHCR)
ghcr.io/samuelmarcinko/dealership:latest
         │
         ├── Container: demo_bazar        → demobazar.webshine.sk
         ├── Container: autobazar_kosice  → kosice.webshine.sk
         └── Container: autobazar_xyz     → xyz.sk
```

Každý tenant = **vlastný Docker container + vlastná PostgreSQL DB**.
Izolácia je garantovaná infraštruktúrou, nie kódom.

### Štruktúra na VPS

```
VPS (/srv/)
├── tenants/
│   ├── demo_bazar/
│   │   ├── docker-compose.yml   ← konfig containera (image, env, volumes)
│   │   └── .env                 ← secrets (DATABASE_URL, JWT_SECRET...)
│   └── autobazar_xyz/
│       ├── docker-compose.yml
│       └── .env
│
└── data/
    ├── demo_bazar/
    │   ├── uploads/             ← fotky vozidiel (servírované cez Next.js /uploads)
    │   └── pdfs/
    │       └── templates/       ← .docx šablóny zmlúv
    └── autobazar_xyz/
        ├── uploads/
        └── pdfs/
            └── templates/
```

### Čo je v Docker image (mení sa cez GitHub)
- Kompilovaný Next.js kód
- node_modules, Prisma client
- Node.js runtime

### Čo NIE je v image (konfiguruje sa per-tenant na VPS)
- `.env` (DATABASE_URL, JWT_SECRET, SMTP...)
- `docker-compose.yml` (volumes, porty, doména)
- Dáta (obrázky, PDF šablóny) — v `/srv/data/TENANT/`

---

## CI/CD Pipeline

```
git push origin main
       │
       ▼
GitHub Actions:
  1. docker build → ghcr.io/samuelmarcinko/dealership:latest
  2. docker push → GHCR
  3. SSH na VPS →
       cd /srv/tenants/demo_bazar
       docker compose pull
       docker compose up -d --force-recreate
```

**Kód nikdy nemusí byť na VPS.** `/srv/tenants/TENANT/` obsahuje len 2 súbory.

---

## Env premenné (per tenant)

```env
TENANT_ID=demo_bazar
TENANT_NAME="Demo Bazar"
DATABASE_URL=postgresql://user:pass@postgres:5432/demo_bazar
JWT_SECRET=...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://demobazar.webshine.sk
UPLOAD_PATH=/app/public/uploads      # fotky vozidiel
PDF_PATH=/app/pdfs                   # šablóny zmlúv
PORT=3000
SMTP_HOST=...                        # e-mail (voliteľné)
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
CONTACT_EMAIL=...
```

---

## Dátové cesty (volumes v containeri)

| Účel | Cesta v containeri | Cesta na VPS |
|------|--------------------|--------------|
| Fotky vozidiel | `/app/public/uploads` | `/srv/data/TENANT/uploads/` |
| PDF/DOCX šablóny | `/app/pdfs/templates/` | `/srv/data/TENANT/pdfs/templates/` |

---

## Kľúčové funkcie appky

### Správa vozidiel
- CRUD (make, model, rok, cena, km, palivo, prevodovka, VIN...)
- Galéria fotografií s drag&drop zoradením
- Make Combobox — searchable dropdown so 70+ značkami + top značky z DB
- Feature sekcie: Bezpečnosť / Komfort / Ďalšia výbava (3 farebné sekcie)
- Status: Dostupné / Rezervované / Predané
- Auto-generovaný URL slug z názvu

### Predaj vozidla
- Modal: výber zákazníka + predajná cena + dátum + poznámka
- Po predaji: krok 2 — generovanie DOCX dokumentov (zmluvy)
- Vozidlo sa automaticky presunie do "Predané vozidlá"

### Šablóny zmlúv (DOCX)
- Admin nahrá `.docx` šablónu s premennými `{klient_meno}`, `{vozidlo_vin}` atď.
- Pri predaji sa automaticky dosadia dáta klienta + vozidla
- Generovanie: `docxtemplater` + `pizzip` (in-memory, žiadne systémové závislosti)
- Výstup: `.docx` na stiahnutie priamo v modali predaja

**Dostupné premenné v šablónach:**
```
Klient:    {klient_meno} {klient_priezvisko} {klient_cele_meno} {klient_firma}
           {klient_nazov} {klient_ico} {klient_dic} {klient_ic_dph}
           {klient_telefon} {klient_email} {klient_adresa}
Vozidlo:   {vozidlo_titul} {vozidlo_znacka} {vozidlo_model} {vozidlo_variant}
           {vozidlo_rok} {vozidlo_vin} {vozidlo_farba} {vozidlo_km}
           {vozidlo_palivo} {vozidlo_prevodovka} {vozidlo_karoseria}
           {vozidlo_objem} {vozidlo_vykon}
Predaj:    {predaj_cena} {predaj_cena_cislo} {predaj_datum} {predaj_poznamka}
Predajca:  {predajca_nazov} {predajca_adresa} {predajca_telefon}
           {predajca_email} {predajca_ico} {predajca_dic}
Ostatné:   {datum_dnes}
```

### Zákazníci
- Fyzická osoba (meno, priezvisko) alebo Firma (IČO, DIČ, IČ DPH)
- Prepojenie na predané vozidlá

### Branding per tenant
- Logo, primárna farba, font
- Hero sekcia (titulok, podtitulok, tlačidlá, bg obrázok)
- Štatistiky, výhody, "Ako to funguje"
- Kontaktné údaje (telefón, email, adresa)
- Announcement bar (banner)
- Custom CSS

### Verejná časť (frontend)
- Homepage s animáciami (AnimateIn komponent)
- Zoznam vozidiel s filtrami (značka, palivo, cena, rok...)
- Detail vozidla: galéria, specs, 3 feature sekcie, InquiryModal ("Mám záujem")
- InquiryModal: formulár → POST /api/contact (bez ToastProvider závislosti — inline stavy)
- Kontaktná stránka, O nás, vlastné stránky (Page Builder s Craft.js)

### Admin
- Dashboard s štatistikami + posledné vozidlá (thumbnail, km, palivo, dátum)
- Nastavenia: branding, SEO, kontakt, sociálne siete
- Import vozidiel z XML
- Šablóny zmlúv: `/admin/documents`

---

## Databázové modely (Prisma)

```
User              — admin používatelia (ADMIN | EDITOR)
Vehicle           — vozidlá (+ safetyFeatures, comfortFeatures, otherFeatures)
VehicleImage      — fotky vozidiel
Customer          — zákazníci (PERSON | COMPANY)
DocumentTemplate  — .docx šablóny zmlúv
TenantSettings    — key-value store pre branding/nastavenia
CustomPage        — vlastné stránky (Page Builder)
```

---

## Dôležité poznámky pre vývoj

### Migrácie
- Lokálne nemáme `.env` s `DATABASE_URL` (DB beží len v Dockeri na VPS)
- `npx prisma generate` funguje lokálne (generuje TypeScript typy)
- `npx prisma migrate dev` treba spúšťať na VPS alebo s lokálnou DB
- Migračné SQL súbory vytvárame manuálne v `prisma/migrations/`
- Na VPS: `docker exec CONTAINER npx prisma migrate deploy`

### Súbory a cesty
- Fotky vozidiel: `/public/uploads/vehicles/` → servíruje Next.js na `/uploads/vehicles/`
- PDF šablóny: `PDF_PATH/templates/` (default: `./pdfs/templates/` lokálne)
- Upload API: `/api/upload` (len obrázky), `/api/documents/templates` (len .docx)

### ToastProvider
- `ToastProvider` je len v admin layoute (`src/app/admin/(dashboard)/layout.tsx`)
- Verejné komponenty (`InquiryModal` atď.) NESMÚ používať `useToast` — používajú inline error/success stavy

### TypeScript
- Vždy spustiť `npx tsc --noEmit` pred commitom
- `new Response(arrayBuffer, headers)` — nie `new NextResponse(buffer)` pre binárne odpovede

---

## Admin navigácia (sidebar)

```
Dashboard
Zákazníci
Ponuka vozidiel
Predané vozidlá
Šablóny zmlúv       ← /admin/documents
Používatelia
Stránky
Nastavenia
Import
```

---

## Ako nasadiť zmenu kódu

```bash
git add .
git commit -m "popis zmeny"
git push origin main
# → GitHub Actions automaticky zbuilduje a nasadí
```

## Ako zmeniť konfig tenanta na VPS

```bash
ssh user@vps
nano /srv/tenants/demo_bazar/docker-compose.yml   # alebo .env
cd /srv/tenants/demo_bazar
docker compose up -d --force-recreate
```

## Ako pridať nového tenanta na VPS

```bash
cp -r /srv/tenants/demo_bazar /srv/tenants/novy_tenant
nano /srv/tenants/novy_tenant/docker-compose.yml   # zmeniť mená, doménu
nano /srv/tenants/novy_tenant/.env                 # nová DB, secrets
mkdir -p /srv/data/novy_tenant/uploads /srv/data/novy_tenant/pdfs/templates
cd /srv/tenants/novy_tenant && docker compose up -d
docker exec novy_tenant npx prisma migrate deploy
```
