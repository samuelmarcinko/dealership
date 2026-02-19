# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Multi-Tenant White-Label SaaS Platform for Car Dealerships
### Demo Tenant: demobazar.webshine.sk
**Last updated:** 2026-02-19

---

## 1. Executive Summary

We are building a modern, production-ready, multi-tenant white-label SaaS web application for car dealerships (autobazár platform).

This system serves as:
- **Public-facing dealership website** (frontend)
- **Internal administration system** (backend UI)
- **Scalable SaaS platform** for multiple independent dealerships

### Core principles
| Principle | Implementation |
|-----------|---------------|
| Multi-tenant | Database-per-tenant, one container per tenant |
| Infrastructure | Docker + Traefik v2.11, deployed on Hetzner VPS |
| Tech stack | Next.js 15 + TypeScript + Prisma + PostgreSQL + Tailwind |
| Deployment | GitHub → VPS pull → `docker compose up -d` |

---

## 2. Infrastructure (Already Deployed – MUST NOT CHANGE)

### 2.1 Server
- **Provider:** Hetzner Cloud, Ubuntu 24.04 LTS
- Docker Engine + Compose plugin installed
- UFW firewall (ports 22, 80, 443 only)
- Root SSH disabled, Fail2ban enabled

### 2.2 Docker Architecture
```
Global network: web (external, shared by all tenants + Traefik + Postgres)
```

### 2.3 Reverse Proxy: Traefik v2.11
- Location: `/srv/proxy/traefik`
- Automatic HTTPS via Let's Encrypt (`certresolver=le`)
- Dashboard: `https://control.webshine.sk`
- All app containers: **NO public ports**, listen on port 3000 internally

### 2.4 PostgreSQL
- Image: `postgres:16`, network: `web`
- Data: `/srv/data/postgres`
- Accessible only inside Docker network as hostname `postgres`

---

## 3. Multi-Tenant Architecture

### 3.1 Database Model
**Strategy:** Database-per-tenant

| Tenant | Database | User |
|--------|----------|------|
| demo_bazar | `demo_bazar` | `demo_bazar_user` |

### 3.2 Server File Structure
```
/srv/
  proxy/traefik/           # Traefik config
  tenants/
    demo_bazar/            # docker-compose.yml + .env for this tenant
  data/
    postgres/              # Postgres data volume
    demo_bazar/
      uploads/             # Mounted into container at /app/public/uploads
```

---

## 4. Application Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Styling | Tailwind CSS 3 + shadcn/ui-style components |
| Auth | JWT via `jose`, httpOnly cookies |
| Image processing | sharp |

### Data Models
```
User            – admin/editor accounts
Vehicle         – full vehicle record with specs
VehicleImage    – ordered image gallery per vehicle
TenantSettings  – key/value store (xml_feed_url, sync_interval_minutes)
```

---

## 5. Public Frontend

| Page | Route | Features |
|------|-------|---------|
| Home | `/` | Hero, featured vehicles, why-us, CTA |
| Vehicles | `/vehicles` | Grid listing, sidebar filters (make, fuel, price, year) |
| Vehicle detail | `/vehicles/[id]` | Image gallery, specs table, features, contact CTA |
| About | `/about` | Company story, values |
| Contact | `/contact` | Contact form with email delivery (Nodemailer) |

**Design:** Dark slate-900 header/footer, orange-500 accent, mobile-first responsive.

---

## 6. Admin Backend

| Section | Route | Features |
|---------|-------|---------|
| Login | `/admin/login` | Email + password, JWT cookie auth |
| Dashboard | `/admin` | Stats cards, recent vehicles |
| Vehicles | `/admin/vehicles` | Table list, CRUD, image upload |
| Users | `/admin/users` | Table list, CRUD |
| Import Settings | `/admin/settings` | XML feed URL + sync interval + branding + live sync status |

---

## 7. Environment Variables

```bash
TENANT_ID=demo_bazar
TENANT_NAME="Demo Bazar"
DATABASE_URL=postgresql://demo_bazar_user:PASSWORD@postgres:5432/demo_bazar
JWT_SECRET=<64-char random string>
NEXT_PUBLIC_APP_URL=https://demobazar.webshine.sk
PORT=3000
NODE_ENV=production
UPLOAD_PATH=/app/public/uploads

# Email (Phase 2) – leave blank to disable
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=<smtp password>
SMTP_FROM="Demo Bazar <noreply@example.com>"
CONTACT_EMAIL=info@example.com
```

---

## 8. Phase Roadmap

### Phase 1 ✅ (this implementation)
- [x] Next.js 15 + TypeScript + Tailwind + shadcn/ui-style components
- [x] Prisma schema: User, Vehicle, VehicleImage, TenantSettings
- [x] Public frontend: Home, Vehicles, Vehicle detail, About, Contact
- [x] Admin: Login, Dashboard, User CRUD, Vehicle CRUD + image upload
- [x] Import Settings UI (URL stored, no sync yet)
- [x] Multi-stage Dockerfile with standalone output
- [x] docker-compose.tenant.yml with Traefik labels
- [x] JWT auth with httpOnly cookies
- [x] DB migrations via `prisma migrate deploy` at container startup

### Phase 2 ✅
- [x] XML feed parser (autobazar.eu format, flexible field mapping)
- [x] Background sync worker (`node-cron`, dynamic interval from DB)
- [x] Vehicle deduplication by `externalId` (upsert, vanished → SOLD)
- [x] Email notifications (Nodemailer SMTP, graceful fallback)
- [x] Contact form email delivery (notification + auto-reply)
- [x] Tenant branding (businessName, logo, contact info, social links via TenantSettings)
- [x] CI/CD pipeline (GitHub Actions → GHCR → SSH VPS deploy)
- [x] Custom 404 page

### Phase 3 (upcoming)
- [ ] PDF export for vehicle listings
- [ ] Advanced filtering (colour, body type, features)
- [ ] Vehicle comparison feature
- [ ] Enquiry / lead management in admin

---

## 9. Non-Functional Requirements

- Production-ready, clean architecture
- Modular code, prepared for 20+ tenants
- Deterministic Docker builds
- No hardcoded tenant IDs or credentials
- All secrets via environment variables only
