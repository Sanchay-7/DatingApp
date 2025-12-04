# Premium Subscription - Production Readiness Checklist

## ✅ Backend Configuration

### 1. Cashfree Payment Gateway
Update `.env` file in backend:

```env
# Change from sandbox to production
CASHFREE_ENV=production

# Replace with your PRODUCTION credentials from Cashfree Dashboard
CASHFREE_APP_ID=YOUR_PRODUCTION_APP_ID
CASHFREE_SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY
```

### 2. Frontend URLs
Update `.env` in backend:

```env
# Set your production domain
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 3. Database
Ensure PostgreSQL enum is synced:
```bash
cd backend
npx prisma db push
```

Verify enum values:
```sql
SELECT enumlabel FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'SubscriptionTier';
```
Should return: `FREE`, `PREMIUM_MAN`

---

## ✅ Frontend Configuration

### 1. Environment Variables
Update `.env.local` in frontend:

```env
# Add Cashfree environment mode
NEXT_PUBLIC_CASHFREE_ENV=production

# Update API URL to production backend
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### 2. Payment Success URL
The payment return URL is automatically set in `paymentController.js`:
```javascript
return_url: `${process.env.FRONTEND_URL}/payment-success`
```

---

## ✅ Cashfree Dashboard Setup

### 1. Create Production Account
- Go to [Cashfree Dashboard](https://merchant.cashfree.com/)
- Switch from TEST mode to LIVE mode
- Get Production credentials: APP_ID and SECRET_KEY

### 2. Configure Webhook
Set webhook URL in Cashfree dashboard:
```
https://api.yourdomain.com/api/payment/webhook
```

### 3. Verify Settlement Account
- Ensure bank account is verified
- Complete KYC if required

---

## ✅ Pricing Structure Verification

### Men (FREE tier)
- 10 likes per day
- Limited features
- No backtracks

### Men (PREMIUM_MAN - ₹49/month)
- ✅ Unlimited likes per day
- ✅ Unlimited backtracks
- ✅ 5 SuperSwipes per week
- ✅ 1 Spotlight per month
- ✅ All premium features

### Women (FREE tier)
- ✅ Unlimited likes per day
- ✅ Unlimited backtracks
- ✅ All premium features FREE
- ❌ Cannot purchase subscription (restricted)

---

## ✅ Testing Checklist

### Before Going Live

1. **Test Payment Flow (Sandbox)**
   - [ ] Male user can create payment order
   - [ ] Payment modal opens successfully
   - [ ] Payment success redirects correctly
   - [ ] Subscription is activated in database
   - [ ] User tier changes from FREE to PREMIUM_MAN

2. **Test Access Control**
   - [ ] Women cannot access premium page (redirected to dashboard)
   - [ ] Women cannot create payment orders (403 error)
   - [ ] Women have unlimited likes by default

3. **Test Like Limits**
   - [ ] FREE men: 10 likes/day limit enforced
   - [ ] PREMIUM_MAN: Unlimited likes working
   - [ ] FREE women: Unlimited likes working

4. **Test Subscription Display**
   - [ ] Premium page shows "₹49 per month"
   - [ ] Subscribed users see "You are subscribed to Premium at ₹49 per month"

### After Going Live

1. **Monitor First Transaction**
   - [ ] Test with small amount (₹1) if possible
   - [ ] Verify webhook receives payment confirmation
   - [ ] Check database for correct subscription tier
   - [ ] Verify settlement in Cashfree dashboard

2. **Security Checks**
   - [ ] Webhook signature validation working
   - [ ] JWT tokens validated correctly
   - [ ] Gender checks preventing women from payment

---

## ✅ Code Changes Summary

### Files Modified
1. `backend/controllers/paymentController.js`
   - Women blocked from creating orders (403 error)
   - Converts "PREMIUM" → "PREMIUM_MAN" for database
   - Simplified verification logic

2. `backend/controllers/userController.js`
   - Women (FREE): Unlimited likes
   - Men (FREE): 10 likes/day
   - Men (PREMIUM_MAN): Unlimited likes

3. `backend/prisma/schema.prisma`
   - Removed `PREMIUM_WOMAN` enum value
   - Only `FREE` and `PREMIUM_MAN` remain

4. `frontend/src/app/dashboard/user/premium/page.jsx`
   - Women redirected to dashboard
   - Shows "You Already Have Everything!" message for women
   - Men see unlimited likes for ₹49/month

---

## ✅ Environment Variables Quick Reference

### Backend (.env)
```env
CASHFREE_ENV=production
CASHFREE_APP_ID=YOUR_PROD_APP_ID
CASHFREE_SECRET_KEY=YOUR_PROD_SECRET_KEY
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_CASHFREE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## ⚠️ Important Notes

1. **Test in Sandbox First**: Always test the complete flow in sandbox mode before switching to production

2. **Webhook Security**: The webhook endpoint validates Cashfree signature using HMAC-SHA256

3. **Database Backup**: Take a backup before deploying to production

4. **Gradual Rollout**: Consider enabling premium for a small group first

5. **Monitoring**: Set up logging for payment events and webhook calls

---

## 🚀 Deployment Steps

1. Update backend `.env` with production credentials
2. Update frontend `.env.local` with production settings
3. Deploy backend first (with database migration)
4. Deploy frontend
5. Test payment flow end-to-end
6. Monitor first few transactions closely
7. Enable for all users

---

## 📞 Support

If you encounter issues:
- Check Cashfree Dashboard logs
- Review backend console logs for payment events
- Verify webhook is receiving POST requests
- Check database for subscription records

**Current Status**: ✅ Ready for production testing
**Next Step**: Update environment variables and test with Cashfree sandbox first
