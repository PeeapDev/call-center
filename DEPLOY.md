# Deployment Guide: Supabase + Vercel + Fly.io

This guide will help you deploy the Call Center application using:
- **Supabase** - PostgreSQL Database
- **Vercel** - Frontend (Next.js)
- **Fly.io** - Backend (NestJS) + Asterisk (Phone System)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL (Frontend)                          │
│                   callcenter.vercel.app                      │
│                   Next.js Application                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   FLY.IO (Backend)                           │
│               callcenter-backend.fly.dev                     │
│                   NestJS API Server                          │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│   SUPABASE (Database)   │    │   FLY.IO (Asterisk)         │
│   PostgreSQL            │    │   callcenter-asterisk.fly.dev│
│   db.xxx.supabase.co    │    │   Phone System (PBX)        │
└─────────────────────────┘    └─────────────────────────────┘
```

## Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| Fly.io Backend | shared-cpu-1x | ~$5 |
| Fly.io Asterisk | shared-cpu-1x | ~$5 |
| **Total** | | **~$10/month** |

---

## Step 1: Set Up Supabase (Database)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: `callcenter`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 1.2 Get Connection Details

1. Go to **Settings** → **Database**
2. Copy these values:
   - **Host**: `db.xxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (the one you set)

### 1.3 Connection String

```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```

---

## Step 2: Deploy to Fly.io (Backend + Asterisk)

### 2.1 Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2.2 Login to Fly.io

```bash
flyctl auth signup   # New account
# or
flyctl auth login    # Existing account
```

### 2.3 Deploy Asterisk

```bash
cd /path/to/call-center

# Create the app
flyctl apps create callcenter-asterisk

# Deploy
flyctl deploy --config fly.asterisk.toml
```

### 2.4 Deploy Backend

```bash
cd backend

# Create the app
flyctl apps create callcenter-backend

# Set secrets (replace with your values)
flyctl secrets set \
  DB_HOST="db.YOUR_PROJECT.supabase.co" \
  DB_PORT="5432" \
  DB_USERNAME="postgres" \
  DB_PASSWORD="YOUR_SUPABASE_PASSWORD" \
  DB_NAME="postgres" \
  JWT_SECRET="$(openssl rand -base64 64)" \
  ASTERISK_ARI_URL="https://callcenter-asterisk.fly.dev:8088/ari" \
  ASTERISK_ARI_USER="callcenter" \
  ASTERISK_ARI_PASSWORD="change_me_ari" \
  ASTERISK_AMI_HOST="callcenter-asterisk.fly.dev" \
  ASTERISK_AMI_PORT="5038" \
  NODE_ENV="production"

# Deploy
flyctl deploy
```

### 2.5 Verify Backend

```bash
# Check status
flyctl status

# View logs
flyctl logs

# Open in browser
flyctl open
```

---

## Step 3: Deploy to Vercel (Frontend)

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Deploy Frontend

```bash
cd frontend

# Login
vercel login

# Deploy
vercel
```

### 3.3 Set Environment Variables

In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://callcenter-backend.fly.dev` |

3. Click "Save"
4. Redeploy: `vercel --prod`

---

## Step 4: Verify Deployment

### Check Backend Health

```bash
curl https://callcenter-backend.fly.dev/health
```

### Check Frontend

Open: `https://your-project.vercel.app`

### Check Asterisk

```bash
curl https://callcenter-asterisk.fly.dev:8088/ari/api-docs/resources.json
```

---

## Step 5: Create Admin User

After deployment, create an admin user:

```bash
# SSH into backend
flyctl ssh console -a callcenter-backend

# Or use the API (update with your backend URL)
curl -X POST https://callcenter-backend.fly.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
flyctl logs -a callcenter-backend

# Check if database is reachable
flyctl ssh console -a callcenter-backend
# Then run: nc -zv db.xxx.supabase.co 5432
```

### Asterisk connection fails

```bash
# Check Asterisk logs
flyctl logs -a callcenter-asterisk

# Verify ports are open
flyctl ips list -a callcenter-asterisk
```

### Database connection issues

1. In Supabase Dashboard → **Settings** → **Database**
2. Check "Connection Pooling" section
3. Make sure "IPv4" connections are allowed

---

## Custom Domain (Optional)

### Vercel (Frontend)

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Add your domain
3. Update DNS records

### Fly.io (Backend)

```bash
flyctl certs create callcenter-backend.yourdomain.com -a callcenter-backend
```

---

## Environment Variables Reference

### Backend (Fly.io Secrets)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Supabase host | `db.xxx.supabase.co` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_NAME` | Database name | `postgres` |
| `JWT_SECRET` | Auth secret | `random-64-char-string` |
| `ASTERISK_ARI_URL` | Asterisk API | `https://callcenter-asterisk.fly.dev:8088/ari` |
| `NODE_ENV` | Environment | `production` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `https://callcenter-backend.fly.dev` |

---

## Next Steps

1. ✅ Set up Supabase
2. ✅ Deploy Asterisk to Fly.io
3. ✅ Deploy Backend to Fly.io
4. ✅ Deploy Frontend to Vercel
5. ⬜ Create admin user
6. ⬜ Configure phone numbers
7. ⬜ Add trial/subscription system
8. ⬜ Set up custom domain
