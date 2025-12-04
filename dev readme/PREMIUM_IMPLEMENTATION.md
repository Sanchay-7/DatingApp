# Premium Features Implementation Guide

## Overview
This guide explains how the premium features system works with Cashfree payment integration in INR.

## Features Implemented

### 1. **Premium Tiers**
- **FREE (Default)**: Free access with basic features
- **PREMIUM**: ₹1,999/month - Full premium features
- **BOOST**: ₹2,999/month - All premium + enhanced features

### 2. **Feature Breakdown** (As per your image)

#### Premium Features (₹1,999):
- ✅ Unlimited likes
- ✅ Beeline
- ✅ Advanced filters
- ✅ Incognito mode
- ✅ Travel mode
- ✅ 5 SuperSwipes a week
- ✅ 1 Spotlight a week
- ✅ Unlimited Extends
- ✅ Unlimited Rematch
- ✅ Unlimited Backtrack

#### Boost Features (₹2,999):
- ✅ All Premium features
- ✅ Enhanced SuperSwipes
- ✅ Enhanced Spotlight

## Database Schema Updates

### New Enums Added:
```prisma
enum SubscriptionTier {
  FREE
  PREMIUM
  BOOST
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  CANCELLED
  EXPIRED
}
```

### New Model: Subscription
```prisma
model Subscription {
  id            String
  userId        String @unique
  tier          SubscriptionTier
  status        SubscriptionStatus
  startDate     DateTime
  endDate       DateTime
  superSwipesWeekly Int
  spotlightsMonthly Int
  unlimitedExtends  Boolean
  unlimitedRematch  Boolean
  unlimitedBacktrack Boolean
}
```

### User Model Updates:
```prisma
subscriptionTier  SubscriptionTier  @default(FREE)
subscription      Subscription?
superSwipesLeft   Int
spotlightsLeft    Int
backtrackAvailable Boolean
```

### Payment Model Updates:
Added `subscriptionTier` field to track which tier is being purchased.

## API Endpoints

### Create Payment Order
**POST** `/api/payment/create`

Request:
```json
{
  "userId": "user-id",
  "amount": 1999,
  "email": "user@example.com",
  "phone": "9876543210",
  "subscriptionTier": "PREMIUM"
}
```

Response:
```json
{
  "order": {
    "order_id": "123456",
    "payment_link": "https://cashfree.com/pay/...",
    "cf_payment_url": "https://..."
  },
  "payment": {
    "id": "payment-id",
    "orderId": "123456",
    "status": "PENDING"
  }
}
```

### Verify Payment
**POST** `/api/payment/verify`

Request:
```json
{
  "orderId": "123456",
  "cfPaymentId": "payment-id",
  "txStatus": "SUCCESS"
}
```

Response:
```json
{
  "message": "Payment updated",
  "payment": {
    "status": "SUCCESS",
    "subscriptionTier": "PREMIUM"
  }
}
```

### Webhook
**POST** `/api/payment/webhook`
- Cashfree sends payment updates
- System automatically creates/updates subscription
- Updates user subscription tier

## Frontend Pages

### 1. Premium Page
**Location**: `/dashboard/user/premium`
- Shows pricing tiers (Premium ₹1,999 & Boost ₹2,999)
- Feature comparison table
- Upgrade buttons with Cashfree integration
- FAQ section
- Shows current subscription status

### 2. Payment Success Page
**Location**: `/payment-success`
- Verifies payment status
- Creates subscription if payment successful
- Redirects to premium page on success
- Shows error message on failure

## Payment Flow

1. **User clicks "Upgrade"** on Premium page
2. **Frontend sends payment request** with:
   - User ID
   - Amount (₹1,999 or ₹2,999)
   - Email & Phone
   - Subscription Tier

3. **Backend creates Cashfree order** and returns payment link

4. **Frontend redirects to Cashfree** payment gateway

5. **User completes payment** on Cashfree

6. **Cashfree redirects to success page** with order details

7. **Frontend verifies payment** with backend

8. **Backend updates:**
   - Payment status to SUCCESS
   - Creates/updates Subscription
   - Updates User tier
   - Sets premium feature flags

9. **User redirected to premium page** with active subscription

## Environment Variables Required

Add to `.env` (Backend):
```
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret
CASHFREE_WEBHOOK_SECRET=your_webhook_secret
CASHFREE_ENV=sandbox  # or production
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## Database Migration

Run these commands in the `backend` directory:

```bash
# Generate migration
npx prisma migrate dev --name add_premium_subscriptions

# Or if you prefer:
npx prisma db push
```

## Testing Cashfree Payment (Sandbox)

1. Use test card numbers from Cashfree docs
2. Amount in INR (₹1,999 or ₹2,999)
3. Phone: 9999999999
4. Email: test@example.com

Test Cards:
- Success: 4111 1111 1111 1111
- Failed: 4555 5555 5555 5555
- 3D Secure: 5555 5555 5555 4444

## Features to Implement Next

1. **Subscription Management**
   - View active subscription
   - Renew/upgrade subscription
   - Cancel subscription

2. **Premium Feature Usage**
   - Track SuperSwipes usage
   - Track Spotlight usage
   - Implement feature access control

3. **Admin Dashboard**
   - View subscription statistics
   - Revenue reports
   - Refund management

4. **Email Notifications**
   - Order confirmation
   - Subscription renewal reminders
   - Payment failed notifications

## Pricing in INR

- **Premium**: ₹1,999 (~$24 USD) - Monthly
- **Boost**: ₹2,999 (~$36 USD) - Monthly

These are competitive pricing for dating apps in India.

## Troubleshooting

### Payment not verifying
- Check `CASHFREE_WEBHOOK_SECRET` is correct
- Verify orderId matches in database
- Check network logs for webhook calls

### Subscription not created
- Verify `subscriptionTier` is passed correctly
- Check Prisma is connected to DB
- Check user exists before payment

### Wrong amount displayed
- Verify `NEXT_PUBLIC_API_BASE_URL` in frontend .env
- Check backend is using correct amount from request

## Security Considerations

1. ✅ Webhook signature validation
2. ✅ User ID verification in payment creation
3. ✅ Amount validation on backend
4. ✅ Unique orderId generation by Cashfree
5. ⚠️ TODO: Add rate limiting on payment endpoints
6. ⚠️ TODO: Add fraud detection

## Notes

- Subscriptions are valid for 1 month from purchase date
- SuperSwipes reset weekly (every Sunday)
- Spotlights reset monthly (1st of month)
- Backtrack is always available (unlimited)
- Free tier users can still see basic features
