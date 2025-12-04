# Premium Features API Reference

## Payment Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payment/create`

**Purpose:** Initiates a payment with Cashfree

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "amount": 1999,
  "email": "user@example.com",
  "phone": "9876543210",
  "subscriptionTier": "PREMIUM"
}
```

**Response (Success):**
```json
{
  "order": {
    "order_id": "order_1234567890",
    "order_amount": 1999,
    "order_currency": "INR",
    "customer_details": {
      "customer_id": "user-uuid",
      "customer_email": "user@example.com",
      "customer_phone": "9876543210"
    },
    "payment_link": "https://sandbox.cashfree.com/pg/...",
    "cf_payment_url": "https://..."
  },
  "payment": {
    "id": "payment-id",
    "userId": "user-uuid",
    "orderId": "order_1234567890",
    "amount": 1999,
    "currency": "INR",
    "status": "PENDING",
    "subscriptionTier": "PREMIUM",
    "createdAt": "2024-12-04T10:00:00.000Z",
    "updatedAt": "2024-12-04T10:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Missing required parameters"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "amount": 1999,
    "email": "user@example.com",
    "phone": "9876543210",
    "subscriptionTier": "PREMIUM"
  }'
```

---

### 2. Verify Payment

**Endpoint:** `POST /api/payment/verify`

**Purpose:** Verifies payment after Cashfree redirect

**Request Body:**
```json
{
  "orderId": "order_1234567890",
  "cfPaymentId": "1234567890",
  "txStatus": "SUCCESS"
}
```

**Response (Success):**
```json
{
  "message": "Payment updated",
  "payment": {
    "id": "payment-id",
    "userId": "user-uuid",
    "orderId": "order_1234567890",
    "amount": 1999,
    "currency": "INR",
    "status": "SUCCESS",
    "subscriptionTier": "PREMIUM",
    "cfPaymentId": "1234567890",
    "createdAt": "2024-12-04T10:00:00.000Z",
    "updatedAt": "2024-12-04T10:05:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Missing parameters"
}
```

**What Happens on Success:**
1. Payment status updated to "SUCCESS"
2. Subscription record created/updated with:
   - `tier`: PREMIUM or BOOST
   - `status`: ACTIVE
   - `endDate`: 1 month from now
   - Features allocated:
     - `superSwipesWeekly`: 5
     - `spotlightsMonthly`: 1
     - `unlimitedExtends`: true
     - `unlimitedRematch`: true
     - `unlimitedBacktrack`: true
3. User record updated with:
   - `subscriptionTier`: PREMIUM or BOOST
   - `superSwipesLeft`: 5
   - `spotlightsLeft`: 1
   - `backtrackAvailable`: true

---

### 3. Payment Webhook (Cashfree → Backend)

**Endpoint:** `POST /api/payment/webhook`

**Purpose:** Receives payment updates from Cashfree

**Headers (from Cashfree):**
```
x-webhook-signature: <hmac-sha256-hash>
Content-Type: application/json
```

**Request Body (from Cashfree):**
```json
{
  "orderId": "order_1234567890",
  "txStatus": "SUCCESS",
  "referenceId": "1234567890"
}
```

**Response:**
```json
{
  "message": "Webhook processed"
}
```

**Processing:**
- Validates webhook signature using `CASHFREE_WEBHOOK_SECRET`
- Updates payment status
- Creates subscription if status is SUCCESS
- Updates user tier

---

## User Endpoints

### Get Current User (with subscription info)

**Endpoint:** `GET /api/user/me`

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "firstName": "John",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "accountStatus": "ACTIVE",
    "subscriptionTier": "PREMIUM",
    "superSwipesLeft": 5,
    "spotlightsLeft": 1,
    "backtrackAvailable": true,
    "subscription": {
      "id": "sub-uuid",
      "tier": "PREMIUM",
      "status": "ACTIVE",
      "startDate": "2024-12-04T10:00:00.000Z",
      "endDate": "2025-01-04T10:00:00.000Z",
      "superSwipesWeekly": 5,
      "spotlightsMonthly": 1,
      "unlimitedExtends": true,
      "unlimitedRematch": true,
      "unlimitedBacktrack": true
    }
  }
}
```

---

## Frontend Integration

### In Premium Page Component

```javascript
// Create payment order
const orderResponse = await authFetch('/api/payment/create', {
  method: 'POST',
  body: {
    userId: user.id,
    amount: tier === 'BOOST' ? 2999 : 1999,
    email: user.email,
    phone: user.phoneNumber,
    subscriptionTier: tier,
  },
});

// Redirect to payment
if (orderResponse.order?.payment_link) {
  window.location.href = orderResponse.order.payment_link;
}
```

### In Payment Success Page

```javascript
// Verify payment
const response = await authFetch('/api/payment/verify', {
  method: 'POST',
  body: {
    orderId,
    cfPaymentId,
    txStatus,
  },
});

// Check response
if (response.payment?.status === 'SUCCESS') {
  // Show success message
  // Redirect to premium page
}
```

---

## Pricing Configuration

### Amount Values
```
PREMIUM: 1999  (₹1,999 per month)
BOOST:   2999  (₹2,999 per month)
```

### Subscription Duration
```
Default: 1 month (30 days)
Start Date: Payment completion date
End Date: Start Date + 1 month
```

### Feature Allocation
```
superSwipesWeekly:   5
spotlightsMonthly:   1
unlimitedExtends:    true
unlimitedRematch:    true
unlimitedBacktrack:  true
```

---

## Error Codes & Messages

| Code | Message | Cause |
|------|---------|-------|
| 400 | Missing required parameters | userId, amount, email, or phone not provided |
| 400 | User not found | userId doesn't exist in database |
| 500 | Failed to create order | Cashfree API error |
| 403 | Invalid signature | Webhook signature validation failed |
| 500 | Webhook processing failed | Database error while creating subscription |

---

## Testing Checklist

- [ ] Create payment with PREMIUM tier
- [ ] Create payment with BOOST tier
- [ ] Verify successful payment
- [ ] Verify failed payment
- [ ] Check subscription created in database
- [ ] Check user tier updated
- [ ] Check features allocated
- [ ] Test webhook with valid signature
- [ ] Test webhook with invalid signature
- [ ] Test with Cashfree sandbox credentials
- [ ] Verify payment_link returned to frontend
- [ ] Test redirect to /payment-success
- [ ] Test success message display
- [ ] Test error handling

---

## Cashfree Configuration

### Sandbox URLs
```
API URL: https://sandbox.cashfree.com/pg/orders
```

### Production URLs
```
API URL: https://api.cashfree.com/pg/orders
```

### Required Headers
```
Content-Type: application/json
x-client-id: {CASHFREE_APP_ID}
x-client-secret: {CASHFREE_SECRET_KEY}
x-api-version: 2022-09-01
```

### Environment Variables
```
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_WEBHOOK_SECRET=your_webhook_secret
CASHFREE_ENV=sandbox  # or production
```

---

## Database Queries

### Find user's subscription
```sql
SELECT * FROM "Subscription" WHERE "userId" = 'user-uuid';
```

### Find all active subscriptions
```sql
SELECT * FROM "Subscription" WHERE "status" = 'ACTIVE';
```

### Find all pending payments
```sql
SELECT * FROM "Payment" WHERE "status" = 'PENDING';
```

### Find successful payments
```sql
SELECT * FROM "Payment" WHERE "status" = 'SUCCESS' ORDER BY "createdAt" DESC;
```

### Get subscription revenue
```sql
SELECT 
  DATE(p."createdAt") as date,
  COUNT(*) as count,
  SUM(p."amount") as total
FROM "Payment" p
WHERE p."status" = 'SUCCESS'
GROUP BY DATE(p."createdAt");
```

---

## Response Time Expectations

- Create Order: 2-3 seconds (Cashfree API)
- Verify Payment: 1-2 seconds (local database)
- Webhook Processing: <1 second (local database)

---

## Rate Limiting (Recommended)

Not yet implemented. Add these limits:
- POST /api/payment/create: 5 requests per minute per user
- POST /api/payment/verify: 10 requests per minute per user
- POST /api/payment/webhook: No limit (Cashfree trusted)

---

## Monitoring & Logging

Monitor these in production:
- Failed payment attempts
- Webhook signature failures
- Database errors during subscription creation
- Cashfree API errors

All errors are logged in server console for debugging.

---

## Version History

- **v1.0** (2024-12-04) - Initial release
  - PREMIUM tier (₹1,999)
  - BOOST tier (₹2,999)
  - Cashfree payment integration
  - Automatic subscription creation
