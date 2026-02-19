# Deployment Guide
## AutoBazar SaaS – Traefik + PostgreSQL Integration

---

## Overview

```
Internet → Traefik (web network) → dealership container (port 3000)
                                         │
                                    PostgreSQL (web network, hostname: postgres)
```

The application container joins the shared Docker network `web`, making it reachable by Traefik and by the shared PostgreSQL container without exposing any ports publicly.

---

## Prerequisites on the VPS

All of these are already deployed:

| Component | Status | Location |
|-----------|--------|----------|
| Docker Engine | ✅ | system |
| Docker Compose plugin | ✅ | system |
| Global Docker network `web` | ✅ | `docker network create web` |
| Traefik v2.11 | ✅ | `/srv/proxy/traefik` |
| PostgreSQL 16 | ✅ | Docker container on `web` network |

---

## First-time Setup (per tenant)

### 1. Prepare the PostgreSQL database

Connect to the running Postgres container and create the tenant database and user:

```bash
docker exec -it postgres psql -U master -d masterdb
```

```sql
-- Create tenant user + database
CREATE USER demo_bazar_user WITH PASSWORD 'CHOOSE_A_STRONG_PASSWORD';
CREATE DATABASE demo_bazar OWNER demo_bazar_user;

-- Revoke public schema access (security)
REVOKE ALL ON DATABASE demo_bazar FROM PUBLIC;
GRANT CONNECT ON DATABASE demo_bazar TO demo_bazar_user;
\q
```

### 2. Create tenant directory on VPS

```bash
mkdir -p /srv/tenants/demo_bazar
mkdir -p /srv/data/demo_bazar/uploads/vehicles
```

### 3. Create environment file

```bash
cat > /srv/tenants/demo_bazar/.env << 'EOF'
TENANT_ID=demo_bazar
TENANT_NAME=Demo Bazar
DATABASE_URL=postgresql://demo_bazar_user:CHOOSE_A_STRONG_PASSWORD@postgres:5432/demo_bazar
JWT_SECRET=$(openssl rand -base64 64)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://demobazar.webshine.sk
PORT=3000
UPLOAD_PATH=/app/public/uploads

# Email (optional – leave blank to disable)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=CHANGE_ME
SMTP_FROM=Demo Bazar <noreply@example.com>
CONTACT_EMAIL=info@example.com
EOF
```

> ⚠️ Replace `CHOOSE_A_STRONG_PASSWORD` and regenerate `JWT_SECRET` with `openssl rand -base64 64`.
> Email variables are optional. When `SMTP_HOST` is not set, contact form submissions are logged to stdout instead of sending emails.

### 4. Place docker-compose.yml

Copy `docker-compose.tenant.yml` from this repo to `/srv/tenants/demo_bazar/docker-compose.yml`.

Update the image reference to match your built/published image:

```yaml
image: ghcr.io/YOUR_GITHUB_ORG/dealership:latest
```

Or use a local build by uncommenting the `build:` section and pointing to the cloned repo.

### 5. Start the container

```bash
cd /srv/tenants/demo_bazar
docker compose --env-file .env up -d
```

The container will:
1. Run `prisma migrate deploy` (applies all pending migrations to the DB)
2. Start the Next.js production server on port 3000

### 6. Seed initial data (first run only)

```bash
docker compose exec dealership npm run db:seed
```

Default credentials: `admin@dealership.com` / `admin123`
**Change this password immediately after first login.**

---

## How Traefik Routing Works

The `docker-compose.tenant.yml` includes Traefik labels that instruct Traefik to:

1. Route requests with `Host: demobazar.webshine.sk` → this container
2. Use the `websecure` entrypoint (port 443)
3. Issue a TLS certificate via Let's Encrypt (`certresolver=le`)
4. Forward to the container on internal port 3000

No manual Traefik config file editing is needed — Traefik reads the labels via Docker provider.

```
Browser: https://demobazar.webshine.sk
         │
         ▼
Traefik (port 443, entrypoint: websecure)
  Rule: Host(`demobazar.webshine.sk`) → service: demobazar
         │
         ▼
Container: dealership (port 3000, network: web)
```

---

## Image Uploads (Persistent Storage)

Uploaded vehicle images are stored at:
- **Container path:** `/app/public/uploads/` (served by Next.js at `/uploads/*`)
- **Host path:** `/srv/data/demo_bazar/uploads/`

The volume mount in `docker-compose.tenant.yml`:
```yaml
volumes:
  - /srv/data/demo_bazar/uploads:/app/public/uploads
```

This ensures images survive container restarts and upgrades.

---

## Updating the Application

```bash
# On VPS:
cd /srv/tenants/demo_bazar

# Pull latest image
docker compose pull

# Recreate container (zero-downtime with Traefik health checks)
docker compose up -d --force-recreate
```

Migrations run automatically on each container start.

---

## Adding a New Tenant

1. Create DB user + database in Postgres (see step 1 above, with new names)
2. Create `/srv/tenants/<tenant_slug>/` directory
3. Create `.env` with tenant-specific values
4. Copy `docker-compose.tenant.yml`, update:
   - `TENANT_ID`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`
   - Traefik router name (`demobazar` → `<tenant_slug>`)
   - Traefik `Host()` rule to the new domain
5. Create `/srv/data/<tenant_slug>/uploads/` directory
6. `docker compose up -d`

---

## CI/CD Pipeline (GitHub Actions)

The repository includes `.github/workflows/deploy.yml` which automatically:

1. **Builds** a Docker image and pushes it to GitHub Container Registry (GHCR) on every push to `main`
2. **Deploys** to the VPS via SSH after a successful build

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions** in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | SSH user (e.g. `deploy`) |
| `VPS_SSH_KEY` | Private SSH key (content of `~/.ssh/id_rsa`) |
| `VPS_PORT` | SSH port (default `22`, optional) |

### VPS Prerequisites for CI/CD

The deploy script runs `docker compose pull && docker compose up -d --force-recreate` in `/srv/tenants/demo_bazar`. Ensure:

1. The SSH user has permission to run Docker commands (member of `docker` group)
2. `/srv/tenants/demo_bazar/docker-compose.yml` already exists with the correct image reference pointing to GHCR
3. The `.env` file exists at `/srv/tenants/demo_bazar/.env`

```bash
# Add deploy user to docker group on VPS
usermod -aG docker deploy
```

### Package visibility

The GHCR package is private by default. Either make it public, or add a `CR_PAT` secret and log in before `docker compose pull`:

```bash
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```

---

## Troubleshooting

### Container won't start
```bash
docker compose logs dealership
```

### Check DB connectivity
```bash
docker compose exec dealership npx prisma db pull
```

### Traefik not routing
```bash
# Check Traefik sees the container
curl https://control.webshine.sk/api/http/routers | jq '.[] | select(.name | contains("demobazar"))'
```

### Reset and reseed DB
```bash
docker compose exec dealership npx prisma migrate reset --force
docker compose exec dealership npm run db:seed

```
