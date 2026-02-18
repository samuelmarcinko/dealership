PRODUCT REQUIREMENTS DOCUMENT (PRD)
Multi-Tenant White-Label SaaS Platform for Car Dealerships
1. Executive Summary

We are building a multi-tenant white-label SaaS platform for car dealerships.

The platform must:

Support multiple independent dealerships (tenants)

Use database-per-tenant architecture

Be deployed via Docker

Use Traefik as reverse proxy

Be hosted on a Hetzner Cloud VPS (Ubuntu 24.04)

Be deployed from GitHub

Be production-ready and scalable

This document defines:

Infrastructure constraints

Application architecture

Deployment model

Multi-tenant behavior

Security requirements

Technical implementation boundaries

2. Infrastructure (Already Implemented – Must Be Respected)
2.1 Server Environment

Provider: Hetzner Cloud

OS: Ubuntu 24.04 LTS

Docker Engine installed (official repository)

Docker Compose plugin installed

UFW firewall enabled (ports 22, 80, 443)

Root SSH disabled

Fail2ban enabled

2.2 Docker Architecture
Global Docker Network
docker network create web


All containers must attach to:

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

Each tenant must have:

Dedicated PostgreSQL database

Dedicated PostgreSQL user

Public privileges revoked

Example for demo tenant:

Database:

demo_bazar


User:

demo_bazar_user


Owner:

demo_bazar_user

3.2 Tenant Naming Rules

Tenant slug rules:

lowercase

no diacritics

hyphen allowed for folders

underscore for database names

Example:

Folder:

auto-dom


Database:

auto_dom


User:

auto_dom_user

3.3 Server File Structure
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

Persistent data must be stored in /srv/data

Tenant config must be stored in /srv/tenants/<tenant_slug>

4. Application Requirements
4.1 Framework

Next.js (App Router)

Node.js runtime

TypeScript

Server Components

API routes for backend logic

No Nginx inside app container.
No SQLite.
No direct DB exposure.

4.2 Environment Variables (Required)

Application must read configuration only from environment variables.

Example:

TENANT_ID=demo_bazar
DATABASE_URL=postgresql://demo_bazar_user:password@postgres:5432/demo_bazar
UPLOAD_PATH=/app/uploads
PDF_PATH=/app/pdfs
PORT=3000


No hardcoded DB names.

4.3 Core Modules (Phase 1)
Admin Backend

Authentication (email/password)

Role-based access (admin initially)

Dashboard overview

Vehicle Management

CRUD vehicles

Image uploads

Status (available, reserved, sold)

Client Management

CRUD clients

Link client to vehicle

Contract Generation

Generate PDF contracts

Store in /app/pdfs

Persist in mounted volume

4.4 Public Frontend

List vehicles

Vehicle detail page

SEO-friendly routes

Tenant branding support (logo, colors later)

5. Docker Requirements for App

Claude must generate:

5.1 Dockerfile

Production optimized:

Multi-stage build

Node 20+

Minimal final image

Expose port 3000

CMD to start Next.js in production mode

5.2 docker-compose template (tenant-level)

Each tenant will have:

/srv/tenants/demo_bazar/docker-compose.yml


It must:

Use shared Docker network web

Not expose ports publicly

Use Traefik labels

Mount uploads and pdf volumes

Example Traefik labels:

traefik.enable=true
traefik.http.routers.demo.rule=Host(`demo.webshine.sk`)
traefik.http.routers.demo.entrypoints=websecure
traefik.http.routers.demo.tls.certresolver=le

6. Deployment Strategy
6.1 GitHub-Based Deployment

Claude Code will:

Generate repository

Push to GitHub

VPS pulls repository

Docker image builds on server

docker compose up -d runs

No manual file editing on server.

6.2 Build Constraints

Must work with Docker Compose

Must support environment-based configuration

Must not assume localhost DB

Must use service name postgres inside Docker network

7. Security Constraints

No database exposed to internet

No debug endpoints in production

No hardcoded secrets

Use environment variables only

Respect Docker isolation

8. Future Expansion Requirements

Architecture must allow:

20+ tenants

Worker container for background jobs

Redis integration later

Billing module

Feature flags per tenant

Plugin/override system

9. Non-Functional Requirements

Production-ready

Clean folder structure

Clear separation:

infra

tenant config

persistent data

Minimal container size

Deterministic builds

10. Expected Output from Claude Code

Claude must generate:

Full Next.js project

Prisma schema (PostgreSQL)

Production Dockerfile

docker-compose template

.env example

Clean project structure

Migration-ready database layer

End of PRD