# Debugging Tools Summary

## Files Modified/Created

### 1. Enhanced Logging Files

#### `backend/middleware/auth.js` ✏️ Modified
Added [AUTH-MIDDLEWARE] logging to track authentication flow:
- Request incoming (method + path)
- Token found/missing
- Token verification
- Successful authentication with user ID

#### `backend/controllers/userController.js` ✏️ Previously Modified
Already has [REPORT] logging:
- User starting report
- Duplicate check
- Database record creation
- Success confirmation

#### `backend/controllers/adminController.js` ✏️ Previously Modified
Already has [MODERATION] logging:
- Query start
- Report count found

#### `frontend/src/app/dashboard/user/page.jsx` ✏️ Modified
Added [REPORT-FRONTEND] logging to handleReport():
- Report submission start
- Reason being sent
- Full payload details
- Response received
- Error handling

### 2. New Diagnostic Tools

#### `frontend/src/lib/diagnostics.js` 🆕 NEW
Diagnostic helper functions for debugging API calls:
- `diagnoseFetch()` - Traces any fetch operation
  - Logs URL, method, headers, body
  - Logs response status and body
  - Catches and logs errors
  
- `diagnosticAuthFetch()` - Traces authenticated fetches
  - Verifies window object exists
  - Checks token in localStorage
  - Logs token presence (masked for security)
  - Builds auth headers
  - Calls diagnoseFetch with auth headers

Usage in browser console:
```javascript
import { diagnosticAuthFetch } from '/lib/diagnostics.js';
await diagnosticAuthFetch('/api/user/report', {
  method: 'POST',
  body: { reportedUserId: 'user-id', reason: 'reason' }
});
```

### 3. Test Scripts

#### `backend/testReports.js` 🆕 (Created Earlier)
Direct database inspection script.
Run: `node testReports.js`
Shows:
- Total reports in DB
- Count of PENDING reports
- Full details of all pending reports (with reporter/reportedUser info)

#### `backend/testReportEndpoint.js` 🆕 NEW
Complete API endpoint testing script without frontend.
Run: `TEST_USER_TOKEN=your_token TEST_ADMIN_TOKEN=admin_token node testReportEndpoint.js`
Tests:
- Report submission with actual API call
- Moderation queue retrieval with admin token
- Verification that report appears in queue

### 4. Documentation

#### `DEBUG_GUIDE.md` 🆕 NEW
Comprehensive debugging guide including:
- Overview of the issue
- All recent changes made
- Step-by-step debugging procedures
- Expected logs for successful scenarios
- Troubleshooting table for common issues
- Quick reference for key files to monitor
- Alternative test methods

## How to Use These Tools

### Quick Start (5 minutes)

1. **Restart everything with new logging:**
```powershell
# Terminal 1 - Backend
cd backend
npx nodemon server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

2. **Open browser console (F12 → Console)**

3. **Submit a report through UI**

4. **Check logs in BOTH consoles:**
   - Frontend: Look for `[REPORT-FRONTEND]` messages
   - Backend: Look for `[AUTH-MIDDLEWARE]` and `[REPORT]` messages

### Detailed Investigation (15 minutes)

1. **Check if token exists:**
```javascript
// In browser console
localStorage.getItem('valise_token')
```

2. **Test diagnostic fetch:**
```javascript
// In browser console
import { diagnosticAuthFetch } from '/lib/diagnostics.js';
await diagnosticAuthFetch('/api/user/report', {
  method: 'POST',
  body: { reportedUserId: 'test-id', reason: 'test' }
});
```

3. **Check database directly:**
```powershell
# In backend terminal
cd backend
node testReports.js
```

4. **Check admin page:**
   - Sign in as admin
   - Go to `/admin/moderation`
   - Open browser Network tab
   - Click Refresh button
   - Watch for GET `/api/v1/admin/moderation` request

### Full Integration Test (30 minutes)

```powershell
# Get tokens (you need to do this from browser after signing in)
# Open browser console and run:
# localStorage.getItem('valise_token')       # Copy this
# localStorage.getItem('admin_token')        # Copy this

# Run full test
cd backend
TEST_USER_TOKEN=paste_user_token_here TEST_ADMIN_TOKEN=paste_admin_token_here node testReportEndpoint.js
```

## Expected Output Examples

### Successful Report Flow

**Frontend Console:**
```
[REPORT-FRONTEND] Starting report for user: user-456
[REPORT-FRONTEND] Reason: Inappropriate profile picture
[REPORT-FRONTEND] Payload: {"reportedUserId":"user-456","reason":"Inappropriate profile picture"}
[REPORT-FRONTEND] Response: {success: true, message: "Report submitted successfully..."}
```

**Backend Console:**
```
[AUTH-MIDDLEWARE] Incoming request to POST /api/user/report
[AUTH-MIDDLEWARE] Token found, verifying...
[AUTH-MIDDLEWARE] ✓ Authenticated user ID: user-123
[REPORT] User user-123 reporting user user-456 for: Inappropriate profile picture
[REPORT] Created Report record: report-789
[REPORT] Success: Report submitted for user user-456
```

**Admin Moderation Page:**
```
[AUTH-MIDDLEWARE] Incoming request to GET /api/v1/admin/moderation
[AUTH-MIDDLEWARE] ✓ Authenticated user ID: admin-001
[MODERATION] Fetching pending reports...
[MODERATION] Found 1 pending reports
Moderation queue: [{
  id: "report-789",
  reason: "Inappropriate profile picture",
  reportedUserId: "user-456",
  reporterId: "user-123",
  ...
}]
```

## Troubleshooting Decision Tree

```
Report shows "successfully reported" on frontend?
├─ YES → Check backend console for [REPORT] logs
│  ├─ [REPORT] logs exist?
│  │  ├─ YES → Run testReports.js
│  │  │  ├─ Reports found in DB?
│  │  │  │  ├─ YES → Issue is in admin page
│  │  │  │  │  └─ Check [AUTH-MIDDLEWARE] and [MODERATION] logs in admin moderation page
│  │  │  │  └─ NO → Database write failing
│  │  │  │     └─ Check [REPORT] error log lines
│  │  │  └─ NO logs exist → Run testReports.js to confirm DB query works
│  │  └─ NO [REPORT] logs → Request not reaching backend
│  │     └─ Check browser Network tab for POST status
│  └─ NO [AUTH-MIDDLEWARE] logs → Request not reaching auth middleware
│     └─ Check if route is registered in userRoutes.js
└─ NO → Frontend authFetch call is failing
   └─ Check [REPORT-FRONTEND] error in console
```

## Key Insights

- **All logs use consistent prefix format:** `[COMPONENT]` (e.g., `[REPORT]`, `[AUTH-MIDDLEWARE]`)
- **Three independent flows to check:**
  1. Frontend POST `/api/user/report` → [REPORT-FRONTEND] + [AUTH-MIDDLEWARE] + [REPORT]
  2. Database query via testReports.js
  3. Admin GET `/api/v1/admin/moderation` → [AUTH-MIDDLEWARE] + [MODERATION]
- **Each flow is independently testable** - you can test database independently from API
- **Logs follow request through each stage** - easier to spot where breakdown occurs

## Quick Reference

| Need to check... | Run this... | Look for... |
|---|---|---|
| Token exists | `localStorage.getItem('valise_token')` in console | String that starts with `eyJ` |
| Auth middleware working | Submit report, watch backend | `[AUTH-MIDDLEWARE] ✓ Authenticated` |
| Report being created | Submit report, watch backend | `[REPORT] Created Report record:` |
| Reports in database | `node testReports.js` | `Pending reports: X` |
| Admin fetch working | Go to `/admin/moderation`, watch backend | `[MODERATION] Found X reports` |
| Full flow success | Submit report, check admin page | Report appears in list within 10s |
