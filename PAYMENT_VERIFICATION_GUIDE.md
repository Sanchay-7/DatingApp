# Admin Payment Verification Guide

## Overview
The Payment Verification dashboard allows administrators to review user-submitted payment screenshots and approve or reject them. Approved payments automatically activate premium subscriptions for users.

## Accessing the Feature

1. **Log in as Admin** → Navigate to `/admin`
2. **Click "Payment Verification"** in the sidebar (credit card icon)
3. View all pending payment proofs

## Dashboard Layout

### Main Table
- **User**: Name of the user who submitted the payment
- **Email**: User's email address
- **Phone**: User's phone number
- **Amount**: Payment amount in INR (₹49 for premium)
- **Order ID**: Unique payment identifier
- **Screenshot**: "View" button to see the uploaded image
- **Submitted**: Date/time of submission
- **Action**: "Review" button to open verification modal

### Statistics Cards
- **Pending Verification**: Number of awaiting proofs
- **Total Users**: Count of users with submissions
- **Awaiting Action**: Proofs pending admin decision

## Verification Process

### Step 1: View Proof
Click the "Review" button on any row to open the verification modal.

### Step 2: Review Details
The modal displays:
- **User Details**: Name, gender, email, phone
- **Payment Details**: Amount, currency, subscription tier, submission date
- **Screenshot**: Full-size image of the payment proof

### Step 3: Add Notes (Optional)
Use the **Admin Notes** field to document your decision:
- "Screenshot looks authentic"
- "Already processed - duplicate payment"
- "Screenshot quality too low - needs resubmission"
- Any other relevant notes

### Step 4: Make Decision

#### ✅ Approve & Activate
- Marks payment as `SUCCESS`
- Marks proof as `APPROVED`
- **Automatically activates** premium subscription for 30 days
- User gets all premium features:
  - Unlimited likes
  - Unlimited backtracks
  - 5 SuperSwipes per week
  - 1 Spotlight per month
  - Incognito mode
  - Advanced filters
  - Priority support

#### ❌ Reject Payment
- Marks payment as `MANUAL_REJECTED`
- Marks proof as `REJECTED`
- User remains on FREE tier
- User will need to resubmit payment

## Database Records

### Payment Model Fields
```
- orderId: Unique payment ID
- userId: User who submitted
- amount: Payment amount (49 INR)
- status: PENDING, SUCCESS, MANUAL_REJECTED
- subscriptionTier: PREMIUM_MAN or PREMIUM
- proofUrl: Cloudinary URL of screenshot
- proofPublicId: Cloudinary ID (for deletion)
- proofStatus: PENDING, APPROVED, REJECTED, NONE
- adminNote: Your notes
- verifiedByAdminId: Admin who verified
- verifiedAt: Timestamp of decision
```

### Subscription Auto-Activation
When you approve a payment:
1. Payment status → `SUCCESS`
2. Proof status → `APPROVED`
3. **Subscription created/updated**:
   - Tier: `PREMIUM_MAN`
   - Status: `ACTIVE`
   - Duration: 30 days from approval date
   - Features: All premium features enabled

4. **User updated**:
   - `subscriptionTier`: Changed to `PREMIUM_MAN`
   - `superSwipesLeft`: Set to 5
   - `spotlightsLeft`: Set to 1
   - `backtrackAvailable`: Set to true

## Status Flow

### Successful Approval Path
```
Payment Submitted (MANUAL_PENDING)
         ↓
Screenshot Uploaded (PENDING)
         ↓
Admin Reviews → Clicks "Approve & Activate"
         ↓
Payment Status → SUCCESS
Proof Status → APPROVED
         ↓
Subscription Auto-Activated
User gains Premium Access
```

### Rejection Path
```
Payment Submitted (MANUAL_PENDING)
         ↓
Screenshot Uploaded (PENDING)
         ↓
Admin Reviews → Clicks "Reject Payment"
         ↓
Payment Status → MANUAL_REJECTED
Proof Status → REJECTED
         ↓
User Remains FREE
User Can Resubmit
```

## API Endpoints

### List Pending Proofs
```
GET /api/payment/manual/pending
Authorization: Bearer {admin_token}
Response: { proofs: [...] }
```

### Make Decision
```
POST /api/payment/manual/{orderId}/decision
Authorization: Bearer {admin_token}
Body: {
  approve: true,  // or false
  note: "Optional admin note"
}
Response: { success: true, status: "APPROVED", payment: {...} }
```

## Best Practices

1. **Screenshot Quality**: Verify screenshots show:
   - Transaction confirmation
   - Amount (₹49)
   - Date/time
   - Transaction ID or reference number

2. **Duplicate Prevention**: Check orderId in notes to avoid approving same payment twice

3. **Timely Review**: Try to review submissions within 24 hours

4. **Clear Notes**: Add detailed notes explaining your decision for audit purposes

5. **Follow Company Policy**: Apply consistent approval standards across all users

## Troubleshooting

### Payment Not Found
- Ensure orderId exists in database
- Check if payment was already processed
- Verify user ID is correct

### Image Not Loading
- Check Cloudinary integration is working
- Verify image URL is valid HTTPS
- Check image permissions in Cloudinary

### Subscription Not Activating
- Verify admin has correct role (authAdmin middleware)
- Check Prisma database connection
- Check user already exists in User model
- Review backend console logs for errors

## Support

For issues with the payment verification system:
1. Check backend logs: `npx prisma studio` to view database
2. Test endpoints with Postman/curl
3. Review error messages in admin dashboard
4. Contact development team with error details
