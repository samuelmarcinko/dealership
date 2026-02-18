PRODUCT REQUIREMENTS DOCUMENT (PRD)
Multi-Tenant White-Label SaaS Platform for Car Dealerships
Demo Tenant: demobazar.webshine.sk
1. Executive Summary

We are building a modern, production-ready, multi-tenant white-label SaaS web application for car dealerships (autobazár platform).

This system will serve as:

Public-facing dealership website (frontend)

Internal administration system (backend UI)

Scalable SaaS platform for multiple dealerships

The platform must:

Support multiple independent dealerships (tenants)

Use database-per-tenant architecture

Be deployed via Docker

Use Traefik as reverse proxy

Be hosted on a Hetzner Cloud VPS (Ubuntu 24.04)

Be deployed from GitHub

Follow modern UI/UX standards

Be production-ready and scalable

Demo tenant domain:

https://demobazar.webshine.sk

2. Infrastructure (Already Implemented – MUST BE RESPECTED)
2.1 Server Environment

Provider: Hetzner Cloud

OS: Ubuntu 24.04 LTS

Docker Engine installed (official repository)

Docker Compose plugin installed

UFW firewall enabled (ports 22, 80, 443 only)

Root SSH disabled

Fail2ban enabled

Automatic security updates enabled

2.2 Docker Architecture

Global Docker network:

docker network create web


All containers MUST attach to:

network: web

2.3 Reverse Proxy

Reverse proxy: Traefik v2.11
Location:

/srv/proxy/traefik


Responsibilities:

Route traffic by hostname

Provide automatic HTTPS (Let's Encrypt)

Redirect HTTP → HTTPS

Provide dashboard at:

https://control.webshine.sk


App containers must:

NOT expose ports publicly

Be reachable only through Traefik

Listen internally on port 3000

2.4 PostgreSQL

Postgres runs as Docker container:

Image: postgres:16

Network: web

No public port exposed

Data stored in:

/srv/data/postgres


Postgres is accessible only inside Docker network.

3. Multi-Tenant Architecture
3.1 Database Model

Database-per-tenant strategy.

Each tenant has:

Dedicated PostgreSQL database

Dedicated PostgreSQL user

Public privileges revoked

Demo tenant:

Database:

demo_bazar


User:

demo_bazar_user


Owner:

demo_bazar_user

3.2 Server File Structure
/srv
   /proxy
      /traefik
      /db
   /tenants
      /demo_bazar
   /data
      /postgres
      /demo_bazar
         /uploads
         /pdfs


Principles:

Containers are stateless

Persistent data stored in /srv/data

Tenant config stored in /srv/tenants/<tenant_slug>

4. Application Type & Architecture

This is a full-stack web application consisting of:

A) Public Frontend (Car Dealership Website)
B) Admin Backend (Dealership Management System)

Built with:

Next.js (App Router)

TypeScript

Prisma

PostgreSQL

Tailwind CSS

Modern component system (e.g., shadcn/ui)

5. Public Frontend Requirements

The public website must:

Be modern, responsive, mobile-first

Follow professional automotive UI standards

Use clean typography and strong visual hierarchy

Be SEO-friendly

Main navigation:

Home

Vehicles (Offer)

About Us

Contact

Features:

Vehicles listing page

Vehicle detail page

Filtering (basic for now)

Static About page

Static Contact page

Future-ready for branding (logo, colors per tenant).

6. Admin Backend Requirements

Modern dashboard-style UI.

Must include:

Authentication

Email + password login

Admin role (initially single role)

User Management

CRUD users

Role support (future-ready)

Vehicle Management

CRUD vehicles

Upload vehicle images

Status field (available, reserved, sold)

Image gallery

Import Settings (Phase 1 – UI Only)

Section to define XML feed URL (autobazar.eu)

Store feed URL in database

DO NOT implement actual sync yet

Architecture must allow background sync every 30 minutes later

7. Environment Configuration

App must read from environment variables only.

Example:

TENANT_ID=demo_bazar
DATABASE_URL=postgresql://demo_bazar_user:password@postgres:5432/demo_bazar
UPLOAD_PATH=/app/uploads
PDF_PATH=/app/pdfs
PORT=3000


No hardcoded DB names.

8. Docker Requirements

Must generate:

Dockerfile

Multi-stage build

Node 20+

Production optimized

Expose 3000

Start in production mode

Tenant docker-compose template

For demo tenant:

Host:

demobazar.webshine.sk


Traefik labels must include:

traefik.enable=true
traefik.http.routers.demobazar.rule=Host(`demobazar.webshine.sk`)
traefik.http.routers.demobazar.entrypoints=websecure
traefik.http.routers.demobazar.tls.certresolver=le


Must:

Join external network web

Not expose ports

Mount uploads and pdf volumes

9. Deployment Strategy

GitHub repository: dealership

VPS pulls repository

Docker image builds on VPS

docker compose up -d inside /srv/tenants/demo_bazar

No manual edits on VPS.

10. Non-Functional Requirements

Production-ready

Clean architecture

Modular code

Prepared for 20+ tenants

Scalable

Deterministic builds

END OF PRD