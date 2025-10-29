# Quick Start Guide

Get your salon CRM up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd salon-crm
npm install
```

## Step 2: Set Up Database

You need a PostgreSQL database. Choose one option:

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb salon_crm
```

### Option B: Free Cloud Database
Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for a free PostgreSQL database.

## Step 3: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Use your database URL
DATABASE_URL="postgresql://user:password@localhost:5432/salon_crm"

# Generate a secret (run: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
```

## Step 4: Initialize Database

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# (Optional) Seed with demo data
npm run db:seed
```

## Step 5: Run the App

```bash
npm run dev
```

Visit **http://localhost:3000**

## Demo Login (if you ran seed)

- **Email:** demo@salon.com
- **Password:** password123

## What's Included in Demo Data

- 3 barbers (Alex, Jordan, Taylor) with Mon-Sat 9-5 schedules
- 4 services (Haircut, Beard Trim, Combo, Kids Cut)
- 1 demo customer
- Owner account

## Next Steps

1. **Create your own account** - Register at `/login`
2. **Complete onboarding** - Set up your salon at `/onboarding`
3. **Add staff & services** - Configure your team and services
4. **Test booking** - Create a test appointment
5. **Generate API key** - For n8n integration (Settings → API Keys)

## n8n Integration

### 1. Check Availability

```
HTTP Request Node
- Method: GET
- URL: http://localhost:3000/api/availability
- Query:
  - date: 2025-11-10
  - time: 3:00 PM
  - duration: 30
  - timezone: America/Toronto
- Auth Header: x-api-key: your-api-key
```

### 2. Create Booking

```
HTTP Request Node
- Method: POST
- URL: http://localhost:3000/api/appointments
- Headers:
  - Content-Type: application/json
  - x-api-key: your-api-key
- Body:
{
  "customer": {
    "name": "John Doe",
    "phone": "(416) 555-0199"
  },
  "serviceId": "get-from-services-api",
  "date": "2025-11-10",
  "time": "3:00 PM",
  "source": "PHONE"
}
```

### 3. Track Events

```
HTTP Request Node
- Method: POST
- URL: http://localhost:3000/api/ingest
- Headers:
  - x-api-key: your-api-key
- Body:
{
  "type": "call_received",
  "payload": {
    "callDurationSec": 45,
    "phoneNumber": "(416) 555-0199"
  }
}
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

### NextAuth Errors
- Make sure `NEXTAUTH_SECRET` is set in `.env`
- Verify `NEXTAUTH_URL` matches your local URL

### Port Already in Use
```bash
# Run on different port
PORT=3001 npm run dev
```

## Production Deployment

See [README.md](./README.md#production-deployment) for detailed deployment instructions.

Quick deploy to Vercel:
```bash
npm i -g vercel
vercel
```

## Need Help?

- Check [README.md](./README.md) for full documentation
- Open an issue on GitHub
- Review API endpoints in [README.md](./README.md#api-endpoints)
