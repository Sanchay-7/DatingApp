# Debug Guide: Report Submission Not Appearing in Admin Moderation

## Overview
Reports are showing "successfully reported" on the frontend but not appearing in the admin moderation page. We've added comprehensive logging to trace the issue through the entire flow.

## Recent Changes Made

### Backend Changes
1. **auth.js middleware** - Added [AUTH-MIDDLEWARE] logging at key points:
   - Request received
   - Token found/not found
   - Token verified
   - User authenticated

2. **userController.js reportUser()** - Has detailed [REPORT] logging:
   - User starting to report (userId, reportedUserId, reason)
   - Duplicate check result
   - Database record created
   - Success message

3. **adminController.js getModerationQueue()** - Has [MODERATION] logging:
   - Query started
   - Reports found count

### Frontend Changes
1. **dashboard/user/page.jsx handleReport()** - Added [REPORT-FRONTEND] logging:
   - Report submission starting
   - Reason being sent
   - Full payload
   - Response received

2. **lib/diagnostics.js (NEW)** - Created diagnostic helper functions:
   - `diagnoseFetch()` - Traces all fetch operations
   - `diagnosticAuthFetch()` - Traces authenticated fetches with token validation

## Debugging Steps

### Step 1: Verify Backend is Running with Logging
```powershell
cd backend
npx nodemon server.js
```
Watch for console output starting with `[REPORT]`, `[AUTH-MIDDLEWARE]`, etc.

### Step 2: Verify Frontend is Running
```powershell
cd frontend
npm run dev
```
Open browser console (F12 → Console tab)

### Step 3: Test Report Submission Flow

#### 3a. Check Token in Frontend
In browser console, run:
```javascript
localStorage.getItem('valise_token')
```
Should return a JWT token string. If returns `null` or `undefined`, you're not authenticated.

#### 3b. Test Direct API Call
In browser console, use the diagnostic helper:
```javascript
import { diagnosticAuthFetch } from '/lib/diagnostics.js';

// Test the report endpoint
diagnosticAuthFetch('/api/user/report', {
  method: 'POST',
  body: {
    reportedUserId: 'some-user-id',
    reason: 'Test report reason'
  }
})
```

#### 3c. Submit Report Through UI
1. Go to dashboard
2. Click "Report" on any profile
3. Enter reason
4. Submit
5. **Check two places immediately:**
   - Browser console for `[REPORT-FRONTEND]` messages
   - Backend console for `[AUTH-MIDDLEWARE]` and `[REPORT]` messages

### Step 4: Verify Database
Run the test script:
```powershell
cd backend
node testReports.js
```

This will show:
- Total report count
- Pending report count
- Full details of all pending reports

### Step 5: Test Admin Moderation Page
1. Sign in as admin
2. Go to `/admin/moderation`
3. Watch browser console for `[MODERATION-FRONTEND]` messages (should show auto-refresh attempts)
4. Watch backend console for `[MODERATION]` messages
5. Click "Refresh" button manually
6. Check Network tab (F12 → Network) for the GET request to `/api/v1/admin/moderation`

## Expected Logs

### Successful Report Submission Should Show:

**Frontend Console:**
```
[REPORT-FRONTEND] Starting report for user: [profileId]
[REPORT-FRONTEND] Reason: [reason]
[REPORT-FRONTEND] Payload: {"reportedUserId":"[id]","reason":"[reason]"}
[REPORT-FRONTEND] Response: {success: true, message: "..."}
```

**Backend Console:**
```
[AUTH-MIDDLEWARE] Incoming request to POST /api/user/report
[AUTH-MIDDLEWARE] Token found, verifying...
[AUTH-MIDDLEWARE] ✓ Authenticated user ID: [userId]
[REPORT] User [userId] reporting user [reportedUserId] for: [reason]
[REPORT] Created Report record: [reportId]
[REPORT] Success: Report submitted for user [reportedUserId]
```

### Successful Admin Fetch Should Show:

**Frontend Console (Admin):**
```
Fetching moderation queue...
Moderation queue: [ {...report objects...} ]
```

**Backend Console:**
```
[AUTH-MIDDLEWARE] Incoming request to GET /api/v1/admin/moderation
[AUTH-MIDDLEWARE] ✓ Authenticated user ID: [adminId]
[MODERATION] Fetching pending reports...
[MODERATION] Found 1 pending reports
```

## Potential Issues & Solutions

| Issue | Signs | Solution |
|-------|-------|----------|
| **No token in localStorage** | Frontend shows undefined token, `[AUTH-MIDDLEWARE] No token provided` | User may not be logged in. Check sign-in flow |
| **Token expired** | `[AUTH-MIDDLEWARE] Error: Token expired` | User needs to sign in again |
| **Invalid token** | `[AUTH-MIDDLEWARE] Error: Invalid token` | Token format corrupted. Clear localStorage and sign in |
| **Report not created in DB** | [REPORT-FRONTEND] shows success but testReports.js shows 0 reports | Check [REPORT] logs for errors in report creation |
| **Auth middleware not logging** | No [AUTH-MIDDLEWARE] messages | Request might not be reaching backend. Check network connectivity and request URL |
| **Admin can't see reports** | Reports exist in DB (testReports.js shows them) but admin page is empty | Check admin authentication and GET /api/v1/admin/moderation endpoint |

## Key Files to Monitor

1. **Backend console** - Watch for all [REPORT], [AUTH-MIDDLEWARE], [MODERATION] logs
2. **Frontend console** - Watch for [REPORT-FRONTEND] and error messages
3. **Network tab** (F12 → Network) - Check POST /api/user/report and GET /api/v1/admin/moderation requests/responses
4. **Database** - Run `node testReports.js` to verify Report records exist

## Quick Test: Using diagnostics.js

Create a test file at `frontend/test-report.js`:
```javascript
import { diagnosticAuthFetch } from './src/lib/diagnostics.js';

const testReport = async () => {
  console.log('Starting diagnostic report test...');
  const result = await diagnosticAuthFetch('/api/user/report', {
    method: 'POST',
    body: {
      reportedUserId: 'test-id',
      reason: 'Diagnostic test report'
    }
  });
  console.log('Test result:', result);
};

testReport();
```

Then run:
```powershell
cd frontend
node test-report.js
```

## Next Steps If Still Not Working

1. **Backend console shows [REPORT] logs but no reports in DB** 
   - Prisma schema issue? Run migrations: `cd backend && npx prisma migrate dev`
   - Database connection issue? Test with `node testDb.js`

2. **No [AUTH-MIDDLEWARE] logs appearing**
   - Routes not wired correctly? Check userRoutes.js
   - Request URL wrong? Should be `/api/user/report` not `/api/v1/user/report`
   - CORS issue? Check server.js for CORS configuration

3. **Reports in DB but admin page shows nothing**
   - Admin auth issue? Check admin_token in localStorage
   - GET endpoint not working? Check adminController.js getModerationQueue()
   - Admin permission? Verify authAdmin middleware in adminRoutes.js
