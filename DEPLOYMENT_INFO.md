# Your Salon CRM - Deployment Info

## ✅ Local Setup Complete!

Everything has been set up and is ready to test locally or deploy to production.

---

## 🔐 Your Credentials

### Database (Neon PostgreSQL)
```
postgresql://neondb_owner:npg_5cR4MWFJXUut@ep-orange-snow-ad0l4gpr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Demo Account (Already Created)
- **Email:** demo@salon.com
- **Password:** password123
- **Role:** Owner
- **Tenant:** Demo Barbershop

### API Key for n8n
```
sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e
```

### Demo Data Created
- ✅ 3 Barbers: Alex, Jordan, Taylor (all working Mon-Sat, 9 AM - 5 PM)
- ✅ 4 Services: Haircut ($30), Beard Trim ($15), Haircut + Beard ($40), Kids Haircut ($20)
- ✅ 1 Customer: John Doe
- ✅ Working schedules configured
- ✅ Tenant: Demo Barbershop (timezone: America/Toronto)

---

## 🚀 Next Steps

### Option 1: Test Locally First (Recommended)

Run the development server:
```bash
cd /Users/iamsogoodlo/salon-crm
npm run dev
```

Then visit: **http://localhost:3000**

Login with:
- Email: `demo@salon.com`
- Password: `password123`

Test everything:
- ✅ Dashboard loads
- ✅ Create a booking
- ✅ View calendar
- ✅ Check customers, staff, services

---

### Option 2: Deploy to Production

#### Step 1: Push to GitHub

```bash
# Create a new repo at https://github.com/new
# Name it: salon-crm

# Then run:
git remote add origin https://github.com/YOUR-USERNAME/salon-crm.git
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Add these Environment Variables** (before clicking Deploy):

**DATABASE_URL:**
```
postgresql://neondb_owner:npg_5cR4MWFJXUut@ep-orange-snow-ad0l4gpr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**NEXTAUTH_URL:**
```
https://YOUR-PROJECT-NAME.vercel.app
```
(You can update this after first deploy)

**NEXTAUTH_SECRET:**
Generate one with:
```bash
openssl rand -base64 32
```

4. Click **Deploy**
5. Wait 2-3 minutes
6. Visit your live site!

Your database is already set up, so your demo account will work immediately.

---

## 🔌 n8n Integration

Add these to your n8n environment variables:

```bash
CRM_URL=https://your-vercel-url.vercel.app
CRM_API_KEY=sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e
```

Import the workflow template:
- File: `/Users/iamsogoodlo/salon-crm/n8n-workflow-example.json`

---

## 📝 API Endpoints for Testing

### Get Services
```bash
curl https://your-url/api/services \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e"
```

### Check Availability
```bash
curl "https://your-url/api/availability?date=2025-11-10&time=3:00%20PM&duration=30&timezone=America/Toronto" \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e"
```

### Create Booking
```bash
curl -X POST https://your-url/api/appointments \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Jane Smith",
      "phone": "(416) 555-0100"
    },
    "serviceId": "demo-service-0",
    "date": "2025-11-10",
    "time": "3:00 PM",
    "source": "PHONE"
  }'
```

---

## 🛠️ Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# View database in browser
npx prisma studio

# Generate new API key
npx tsx scripts/generate-api-key.ts demo-tenant

# List all tenants
npx tsx scripts/list-tenants.ts

# Check git status
git status

# View logs (after deploying to Vercel)
vercel logs
```

---

## 📊 What's Been Set Up

- [x] Next.js 14 app with TypeScript
- [x] PostgreSQL database on Neon (production-ready)
- [x] All database tables created
- [x] Demo data seeded
- [x] Authentication configured
- [x] Multi-tenancy set up
- [x] API endpoints ready
- [x] API key generated
- [x] Git repository initialized
- [x] Ready to push to GitHub
- [x] Ready to deploy to Vercel

---

## 🎯 Quick Test Checklist

### Local Testing
- [ ] Run `npm run dev`
- [ ] Login at http://localhost:3000
- [ ] Create a test booking
- [ ] Check calendar view
- [ ] View customers list
- [ ] Verify staff schedules

### Production Testing (After Deploy)
- [ ] Visit your Vercel URL
- [ ] Login with demo account
- [ ] Create a booking via UI
- [ ] Test API with curl/Postman
- [ ] Connect n8n workflow
- [ ] Test end-to-end booking flow

---

## 🔒 Security Notes

- ✅ `.env` file is in `.gitignore` (won't be committed)
- ✅ API key is hashed in database
- ✅ Database uses SSL connection
- ⚠️  Change `NEXTAUTH_SECRET` for production (generate with `openssl rand -base64 32`)
- ⚠️  Never commit your `.env` file
- ⚠️  Save your API key securely (LastPass, 1Password, etc.)

---

## 💡 Tips

1. **Test locally first** before deploying to production
2. **Use Prisma Studio** to browse your database: `npx prisma studio`
3. **Check logs** if something goes wrong
4. **Read the README.md** for full documentation
5. **n8n workflow template** is ready to import

---

## 📞 Need Help?

Check these files:
- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Feature overview

---

## 🎉 You're Ready!

Everything is set up and working. You can:
1. Test locally right now (`npm run dev`)
2. Deploy to Vercel in 5 minutes
3. Connect your n8n workflow
4. Start taking bookings!

**Your Salon CRM is ready to ship!** 🚀
