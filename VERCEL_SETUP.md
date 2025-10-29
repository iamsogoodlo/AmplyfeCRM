# Vercel Deployment Instructions

## 🚀 Deploy Your Salon CRM to Production

Your code is already on GitHub at: https://github.com/iamsogoodlo/AmplyfeCRM

Follow these exact steps to deploy:

---

## Step 1: Go to Vercel

Visit: [https://vercel.com/new](https://vercel.com/new)

(Sign in with GitHub if you haven't)

---

## Step 2: Import Repository

1. Click **"Import Git Repository"**
2. Find and select **`iamsogoodlo/AmplyfeCRM`**
3. Click **"Import"**

---

## Step 3: Configure Project

**Project Name:** `amplyfe-crm` (lowercase - Vercel will auto-suggest this)

Click **"Continue"**

---

## Step 4: Add Environment Variables

**BEFORE clicking Deploy**, add these 3 environment variables:

Click **"Environment Variables"** section and add:

### Variable 1: DATABASE_URL
**Name:** `DATABASE_URL`
**Value:**
```
postgresql://neondb_owner:npg_5cR4MWFJXUut@ep-orange-snow-ad0l4gpr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Variable 2: NEXTAUTH_URL
**Name:** `NEXTAUTH_URL`
**Value:**
```
https://amplyfe-crm.vercel.app
```

### Variable 3: NEXTAUTH_SECRET
**Name:** `NEXTAUTH_SECRET`
**Value:**
```
hPhAacBXFtEbkOezqscMFJhF2EJIWLMnbossFKa2cr0=
```

---

## Step 5: Deploy!

Click **"Deploy"**

Wait 2-3 minutes...

---

## Step 6: Visit Your Live Site

Once deployed, visit:
**https://amplyfe-crm.vercel.app**

Login with:
- **Email:** demo@salon.com
- **Password:** password123

---

## ✅ That's It!

Your database is already set up with demo data, so everything will work immediately!

### What's Already Configured:
- ✅ Database on Neon (production-ready)
- ✅ Demo account created
- ✅ 3 barbers with schedules
- ✅ 4 services
- ✅ API key for n8n

### Your Production URLs:
- **App:** https://amplyfe-crm.vercel.app
- **API:** https://amplyfe-crm.vercel.app/api/*

### n8n Configuration:
Update your n8n environment variables to:
```
CRM_URL=https://amplyfe-crm.vercel.app
CRM_API_KEY=sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e
```

---

## 🔧 Troubleshooting

### If deployment fails:
1. Check that all 3 environment variables are set
2. Make sure DATABASE_URL includes the full connection string
3. Check Vercel logs for errors

### If you can't log in:
1. Verify NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL matches your domain
3. Clear browser cache and try again

---

## 🎉 You're Live!

Once deployed, you have a production Salon CRM that:
- Handles bookings
- Manages customers & staff
- Provides real-time analytics
- Integrates with n8n
- Scales automatically

**Need help?** Check the main [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)
