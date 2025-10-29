# Salon CRM - AI-Powered Receptionist

A production-ready salon management system with AI voice receptionist integration, built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### Core Functionality
- **Multi-tenant Architecture** - Support multiple salons with isolated data
- **Role-Based Access Control** - Owner, Admin, Stylist, and Viewer roles
- **Smart Availability System** - Real-time barber availability with timezone support
- **Automated Booking** - Create appointments with auto-assignment of available barbers
- **Live Event Feed** - Server-Sent Events (SSE) for real-time updates
- **KPI Dashboard** - Track calls, bookings, conversion rates, and more

### Pages & Modules

#### Auth & Tenancy
- `/login` - Email/password authentication
- `/onboarding` - Tenant creation wizard
- Multi-tenant support with tenant switching

#### Dashboard (`/dashboard`)
- **Home** - KPI cards, charts, live event feed
- **Calendar** - Week view with appointment visualization
- **Bookings** - List, create, filter appointments
- **Customers** - Customer directory with search
- **Staff** - Barber management
- **Services** - Service catalog management
- **Settings** - Tenant, integrations, API keys

### API Endpoints

All endpoints require authentication and are tenant-scoped.

#### Public API (for n8n)
```
GET  /api/barbers              - List all barbers
GET  /api/services             - List all services
GET  /api/availability         - Check availability
POST /api/appointments         - Create appointment
POST /api/ingest               - Ingest events from n8n
GET  /api/events               - SSE stream for live updates
GET  /api/kpis?range=7d        - Get metrics
```

#### Availability API
```bash
GET /api/availability?date=2025-11-10&time=3:00 PM&duration=60&timezone=America/Toronto
```

Response:
```json
{
  "available": true,
  "barberId": "clx...",
  "alternatives": ["3:30 PM", "4:00 PM"]
}
```

#### Create Appointment
```bash
POST /api/appointments
Content-Type: application/json

{
  "customer": {
    "name": "Alex",
    "phone": "(416) 555-0199",
    "email": "alex@example.com"
  },
  "serviceId": "uuid",
  "barberId": "uuid",  // optional - auto-assigns if omitted
  "date": "2025-11-10",
  "time": "3:00 PM",
  "timezone": "America/Toronto",
  "notes": "Low fade",
  "source": "PHONE"
}
```

#### Event Ingestion (from n8n)
```bash
POST /api/ingest
x-api-key: your-api-key

{
  "type": "call_received",
  "payload": {
    "callDurationSec": 45,
    "phoneNumber": "(416) 555-0199"
  }
}
```

Event types: `call_received`, `booking_parsed`, `availability_checked`, `booking_created`, `sms_sent`, `error`

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd salon-crm
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/salon_crm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Optional integrations
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
VAPI_API_KEY=""
WEBHOOK_SIGNING_SECRET="your-webhook-secret"
```

3. **Set up the database:**
```bash
npm run db:push
npm run db:generate
```

4. **Run the development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## n8n Integration

### Replacing Google Calendar Free/Busy

**Old n8n node:**
```
Google Calendar → Get Busy Times
```

**New node:**
```
HTTP Request
- Method: GET
- URL: https://your-app.com/api/availability
- Query Parameters:
  - date: {{$json.date}}
  - time: {{$json.time}}
  - duration: {{$json.duration}}
  - timezone: America/Toronto
```

### Creating Bookings

**Old n8n node:**
```
Google Calendar → Create Event
```

**New node:**
```
HTTP Request
- Method: POST
- URL: https://your-app.com/api/appointments
- Headers:
  - Content-Type: application/json
  - x-api-key: your-api-key
- Body:
  {
    "customer": { ... },
    "serviceId": "...",
    "date": "...",
    "time": "...",
    "source": "PHONE"
  }
```

### Event Tracking

Add after each major step in your n8n workflow:

```
HTTP Request
- Method: POST
- URL: https://your-app.com/api/ingest
- Headers:
  - x-api-key: your-api-key
- Body:
  {
    "type": "call_received",  // or booking_created, sms_sent, etc.
    "payload": { ... }
  }
```

## Data Model

### Core Tables
- `tenants` - Salon organizations
- `user_accounts` - User credentials
- `tenant_users` - User-tenant relationships with roles
- `barbers` - Staff members
- `services` - Service catalog
- `customers` - Customer directory
- `appointments` - Bookings
- `events` - Event log for metrics
- `schedule_rules` - Barber working hours
- `time_offs` - Barber vacations/time off
- `api_keys` - API authentication

### Roles
- **OWNER** - Full access, billing
- **ADMIN** - Full access except billing
- **STYLIST** - Book own appointments, view schedule
- **VIEWER** - Read-only access

## Production Deployment

### Recommended Stack
- **Hosting:** Vercel, Railway, or Render
- **Database:** Neon, Supabase, or Railway PostgreSQL
- **File Storage:** Cloudinary (for logos)
- **Monitoring:** Sentry, LogRocket

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="strong-random-secret"

# Integrations
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
VAPI_API_KEY="..."
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Run database migrations
vercel env pull
npx prisma migrate deploy
```

## Architecture

### Availability Logic
1. Parse date/time in tenant timezone
2. Find candidate barbers (by skill/service or all active)
3. Check schedule rules for weekday/time
4. Check for overlapping appointments
5. Check for time-off periods
6. Return first available or suggest alternatives

### Multi-Tenancy
- Tenant ID stored in session via middleware
- All queries scoped by `tenantId`
- Row-level isolation enforced by Prisma

### Real-time Updates
- Server-Sent Events (SSE) for live dashboard
- Events broadcast per tenant
- Auto-reconnect on connection loss

## API Documentation

Full OpenAPI spec available at: `/api/docs` (TODO)

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## License

MIT

## Support

For issues or questions, open an issue on GitHub or contact support.

---

Built with Next.js 14, Prisma, PostgreSQL, and TypeScript.
