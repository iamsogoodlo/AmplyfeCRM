# What To Do After Vercel Deployment

Your code is live on GitHub: https://github.com/iamsogoodlo/AmplyfeCRM

Follow this guide **after** you deploy to Vercel.

---

## ✅ Step 1: Verify Deployment (2 minutes)

After Vercel finishes deploying (2-3 minutes), you'll get a URL like:
**https://amplyfe-crm.vercel.app**

### Test Login
1. Visit your production URL
2. Login with:
   - **Email:** demo@salon.com
   - **Password:** password123

3. You should see the dashboard!

---

## ✅ Step 2: Test Core Features (5 minutes)

Click through each page to verify everything works:

### Dashboard
- Should show KPI cards (all zeros is normal)
- Live feed section visible
- No errors

### Calendar
- Week view loads
- Shows Mon-Sun
- Empty is normal (no bookings yet)

### Bookings → New Booking
**Create a test booking to verify everything works:**

1. Customer Name: "Test Customer"
2. Phone: "(555) 123-4567"
3. Service: "Haircut" ($30, 30min)
4. Barber: Leave empty (auto-assign)
5. Date: Pick tomorrow
6. Time: Pick 3:00 PM
7. Click **Create Booking**

✅ Should redirect to bookings list and show your booking!

### Customers
- Should show "John Doe" (from seed data)
- Should show your "Test Customer" (from booking)

### Staff
- Should show 3 barbers: Alex, Jordan, Taylor
- Each with different colors

### Services
- Should show 4 services with prices

**If all pages load and you created a booking successfully, your app is fully working!** ✅

---

## ✅ Step 3: Test API Endpoints (5 minutes)

The API is what n8n will use. Test it works:

### A. Get Services
```bash
curl https://amplyfe-crm.vercel.app/api/services \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e"
```

Should return JSON with 4 services.

### B. Check Availability
```bash
curl "https://amplyfe-crm.vercel.app/api/availability?date=2025-11-10&time=3:00%20PM&duration=30&timezone=America/Toronto" \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e"
```

Should return:
```json
{
  "available": true,
  "barberId": "...",
  "alternatives": []
}
```

### C. Create Booking via API
```bash
curl -X POST https://amplyfe-crm.vercel.app/api/appointments \
  -H "x-api-key: sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "API Test",
      "phone": "(555) 999-8888"
    },
    "serviceId": "demo-service-0",
    "date": "2025-11-10",
    "time": "4:00 PM",
    "source": "PHONE"
  }'
```

Should return the created appointment!

**Refresh your dashboard** - you should see the new booking appear!

---

## ✅ Step 4: Connect n8n (10 minutes)

Now connect your n8n workflow to production.

### Update n8n Environment Variables

In your n8n instance settings:

```bash
CRM_URL=https://amplyfe-crm.vercel.app
CRM_API_KEY=sk_a97d25d11de6a69d864b833b64093def8ae4c50f643a6a46ed4f7c4d9f68946e
```

### Import Workflow Template

1. In n8n: **Workflows** → **Import from File**
2. Select: `/Users/iamsogoodlo/salon-crm/n8n-workflow-example.json`
3. Workflow appears with all nodes configured

### Test the Workflow

1. Trigger the workflow manually or send test webhook
2. Check it:
   - ✅ Checks availability
   - ✅ Creates booking
   - ✅ Logs events

3. Go to your CRM dashboard
4. Check **Live Feed** - should show events:
   - `call_received`
   - `booking_parsed`
   - `availability_checked`
   - `booking_created`

---

## ✅ Step 5: Configure for Your Salon (30 minutes)

Now customize it for your actual business:

### Option A: Keep Demo Tenant and Customize
1. Go to **Staff** → Edit barbers to your real staff names
2. Go to **Services** → Update to your real services/prices
3. Update schedules to match your hours
4. Delete demo customer

### Option B: Create New Tenant from Scratch
1. Logout from demo account
2. Click "Create Account"
3. Register with your real email
4. Complete onboarding wizard:
   - Your salon name
   - Your timezone
   - Your services
   - Your staff
5. Your new tenant is ready!

---

## ✅ Step 6: Optional - Custom Domain (5 minutes)

Want `crm.yoursalon.com` instead of `amplyfe-crm.vercel.app`?

### In Vercel:
1. Project → **Settings** → **Domains**
2. Add: `crm.yoursalon.com`

### In Your Domain Registrar:
Add this DNS record:
- **Type:** CNAME
- **Name:** crm
- **Value:** cname.vercel-dns.com

### Update Vercel:
1. **Settings** → **Environment Variables**
2. Edit `NEXTAUTH_URL` → `https://crm.yoursalon.com`
3. **Deployments** → **Redeploy**

Wait 5-10 minutes for DNS to propagate.

---

## ✅ Step 7: Go Live! 🎉

You're ready to take real bookings!

### What You Have Now:
- ✅ Production salon CRM
- ✅ Real-time dashboard with analytics
- ✅ Automated booking via n8n + AI phone agent
- ✅ Customer database
- ✅ Staff scheduling
- ✅ SMS notifications (if Twilio configured)
- ✅ API for integrations

### Next Steps:
1. **Train Your Team**
   - Create accounts for staff
   - Show them how to use the dashboard
   - Train on creating manual bookings

2. **Monitor Daily**
   - Check dashboard KPIs
   - Track conversion rate (calls → bookings)
   - Watch for errors in live feed

3. **Optimize**
   - Adjust barber schedules based on demand
   - Update services/pricing as needed
   - Monitor no-show rates

---

## 📊 What to Monitor

Keep an eye on these:

### In Your CRM Dashboard:
- **Conversion Rate** - Should be 50-80%
- **Calls Received** - Daily volume
- **Bookings Created** - Track growth
- **Errors** - Should be near zero
- **Live Feed** - Watch for issues

### In Vercel:
- Go to your project → **Analytics**
- Watch for:
  - Response times (should be < 500ms)
  - Error rates (should be < 1%)
  - Function invocations

### In Neon (Database):
- Dashboard shows data size
- Free tier: 3GB limit
- Monitor usage monthly

---

## 🆘 Troubleshooting

### Can't Login
- Clear browser cache
- Check `NEXTAUTH_SECRET` is set in Vercel
- Verify `NEXTAUTH_URL` matches your domain

### API Returns 401
- Check API key is correct in n8n
- Verify `x-api-key` header is included
- Check key exists in database

### Bookings Fail
- Verify barbers have schedules (Mon-Sat, 9-5)
- Check time is within working hours
- Look at Vercel logs for errors

### n8n Can't Connect
- Remove trailing slash from `CRM_URL`
- Test API with curl first
- Check API key is exact match

### Check Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs
```

---

## 🎯 Quick Checklist

After deploying, complete this checklist:

- [ ] ✅ Visit production URL
- [ ] ✅ Login with demo account
- [ ] ✅ Create test booking via UI
- [ ] ✅ Test 3 API endpoints with curl
- [ ] ✅ Update n8n environment variables
- [ ] ✅ Import n8n workflow
- [ ] ✅ Test end-to-end booking flow
- [ ] ✅ Verify events in live feed
- [ ] ✅ Customize for your salon
- [ ] ✅ (Optional) Add custom domain
- [ ] ✅ Train your team
- [ ] ✅ Go live with real customers!

---

## 📞 Need Help?

Check these docs:
- [README.md](README.md) - Full documentation
- [VERCEL_SETUP.md](VERCEL_SETUP.md) - Deployment guide
- [DEPLOYMENT_INFO.md](DEPLOYMENT_INFO.md) - Your credentials

Or check Vercel logs for errors:
```bash
vercel logs --follow
```

---

## 🎉 Congratulations!

You now have a fully functional, production-ready salon CRM that:
- Handles automated phone bookings
- Manages customers & staff
- Tracks analytics in real-time
- Integrates with n8n
- Scales automatically

**Start taking bookings!** 🚀
