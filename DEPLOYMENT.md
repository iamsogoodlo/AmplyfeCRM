# Deployment Guide

Complete guide to deploying your Salon CRM to production.

## Pre-Deployment Checklist

- [ ] Test locally with `npm run build && npm start`
- [ ] Set up production database (PostgreSQL)
- [ ] Generate secure secrets
- [ ] Configure domain/DNS
- [ ] Set up monitoring (optional)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps.

### Step 1: Prepare Database

Use a managed PostgreSQL provider:
- [Neon](https://neon.tech) - Free tier, serverless
- [Supabase](https://supabase.com) - Free tier
- [Railway](https://railway.app) - $5/month
- [Render](https://render.com) - Free tier

### Step 2: Push to GitHub

```bash
cd salon-crm
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/salon-crm.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Add environment variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

5. Click "Deploy"

### Step 4: Run Migrations

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npm run db:seed
```

### Step 5: Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` environment variable

---

## Option 2: Deploy to Railway

Railway provides both hosting and database.

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
railway login
```

### Step 2: Create New Project

```bash
railway init
railway add --database postgresql
```

### Step 3: Configure Environment

```bash
# Railway will auto-set DATABASE_URL
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Step 4: Deploy

```bash
railway up
```

### Step 5: Run Migrations

```bash
railway run npx prisma migrate deploy
railway run npm run db:seed
```

---

## Option 3: Deploy to Render

### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New Web Service"
3. Connect GitHub repo
4. Configure:
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`

### Step 2: Create PostgreSQL Database

1. Click "New PostgreSQL"
2. Copy internal database URL

### Step 3: Set Environment Variables

```env
DATABASE_URL=<internal-postgres-url>
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=<generate-secret>
```

### Step 4: Deploy

Render will automatically deploy on git push.

### Step 5: Run Migrations

From Render dashboard → Shell:
```bash
npx prisma migrate deploy
npm run db:seed
```

---

## Option 4: Self-Host with Docker

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: salon_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:your-password@db:5432/salon_crm
      NEXTAUTH_URL: https://your-domain.com
      NEXTAUTH_SECRET: your-secret
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run db:seed
```

---

## Post-Deployment Steps

### 1. Generate API Keys

1. Log in as owner
2. Go to Settings → API Keys
3. Generate key for n8n integration
4. Save securely (shown only once)

### 2. Configure n8n

Update your n8n workflow environment variables:
```env
CRM_URL=https://your-domain.com
CRM_API_KEY=sk_...
```

### 3. Set Up Monitoring (Optional)

#### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Vercel Analytics
Enable in Vercel dashboard → Analytics tab

### 4. Set Up Backups

#### Automatic Database Backups

**Neon:**
- Backups included automatically

**Railway:**
```bash
# Manual backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

**Render:**
- Enable automatic backups in database settings

### 5. Custom Domain SSL

All platforms provide automatic SSL with Let's Encrypt.

---

## Environment Variables Reference

### Required
```env
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_URL             # Your app's public URL
NEXTAUTH_SECRET          # Random 32-char secret
```

### Optional
```env
# Twilio (for SMS)
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Vapi (for AI voice)
VAPI_API_KEY
VAPI_AGENT_ID

# Webhook Security
WEBHOOK_SIGNING_SECRET

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

---

## Security Best Practices

### 1. Secrets Management
- Never commit `.env` to git
- Use platform secret managers
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict IP access
- Regular backups

### 3. API Security
- Rotate API keys monthly
- Monitor API usage
- Set up rate limiting
- Use webhook signing

### 4. Application Security
- Keep dependencies updated
- Enable CORS properly
- Use CSP headers
- Monitor error logs

---

## Scaling

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, start_at);
CREATE INDEX idx_events_tenant_type ON events(tenant_id, type, ts);
CREATE INDEX idx_customers_tenant_phone ON customers(tenant_id, phone);
```

### Caching
Consider adding Redis for:
- Session storage
- API response caching
- Rate limiting

### CDN
Use Vercel Edge Network or Cloudflare for:
- Static asset caching
- DDoS protection
- Global distribution

---

## Monitoring & Maintenance

### Health Check Endpoint
Create `/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date() })
}
```

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://pingdom.com)
- [Better Uptime](https://betteruptime.com)

### Regular Maintenance
- [ ] Review error logs weekly
- [ ] Check database size monthly
- [ ] Update dependencies monthly
- [ ] Review API usage weekly
- [ ] Backup verification monthly

---

## Troubleshooting

### Build Failures
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Test connection
npx prisma studio

# Check migrations
npx prisma migrate status
```

### Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## Support

For deployment issues:
1. Check platform status pages
2. Review platform logs
3. Test locally first
4. Contact platform support

For app issues:
- GitHub issues
- Check README.md
- Review API logs
