# 🚨 URGENT: Missing Environment Variable in Vercel

## The Problem

Your app deployed but **NEXTAUTH_SECRET is missing** in Vercel! That's why you're getting 401 errors.

The logs show:
```
[auth][error] MissingSecret: Please define a `secret`
```

---

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Vercel
1. Open: https://vercel.com/amplyfeais-projects/amplyfe-crm
2. Click **Settings** → **Environment Variables**

### Step 2: Check These 3 Variables

Make sure ALL THREE are set:

**1. DATABASE_URL**
```
postgresql://neondb_owner:npg_5cR4MWFJXUut@ep-orange-snow-ad0l4gpr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**2. NEXTAUTH_URL**
```
https://amplyfe-crm.vercel.app
```

**3. NEXTAUTH_SECRET** ⚠️ **(THIS IS MISSING!)**
```
hPhAacBXFtEbkOezqscMFJhF2EJIWLMnbossFKa2cr0=
```

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**

---

## Why This Happened

When you first set up Vercel, you might have:
- Only added DATABASE_URL
- Or NEXTAUTH_SECRET didn't save properly
- Or it was set to wrong environment (Production/Preview/Development)

---

## After Adding the Secret

Once you redeploy with NEXTAUTH_SECRET:

1. Visit: https://amplyfe-crm.vercel.app
2. Login: demo@salon.com / password123
3. Everything will work!

---

## Verify It's Fixed

After redeploying, check the logs again. You should see:
- ✅ No more "MissingSecret" errors
- ✅ API calls return 200 (not 401)
- ✅ Dashboard loads with data

---

## Quick Test

```bash
# Test API (should return services, not 401)
curl https://amplyfe-crm.vercel.app/api/services \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e"
```

Should return JSON with your 4 services!

---

**Add the NEXTAUTH_SECRET in Vercel settings NOW, then redeploy!** 🚀
