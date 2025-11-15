# Quick Reference Card

## Files with New Logging

```
✏️  MODIFIED (Added Logging):
    backend/middleware/auth.js
    backend/controllers/userController.js (already had logging)
    backend/controllers/adminController.js (already had logging)
    frontend/src/app/dashboard/user/page.jsx

🆕 NEW Files:
    frontend/src/lib/diagnostics.js
    backend/testReports.js
    backend/testReportEndpoint.js
    backend/quickDebug.js

📚 DOCUMENTATION:
    DEBUG_GUIDE.md
    DEBUGGING_TOOLS.md
    ACTION_PLAN.md (this is your step-by-step guide)
    QUICK_REFERENCE.md (this file)
```

## One-Minute Check

```bash
# Terminal 1 - Backend
cd backend && npx nodemon server.js

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Terminal 3 - Quick check
cd backend && node quickDebug.js
```

## Report Flow Checklist

Report submitted → Browser console shows `[REPORT-FRONTEND]` → Backend console shows `[AUTH-MIDDLEWARE]` → Backend console shows `[REPORT]` → `node testReports.js` finds report → Admin page auto-refresh shows report

## Browser Console Tests

```javascript
// Check if logged in
localStorage.getItem('valise_token')

// Test API call
import { diagnosticAuthFetch } from '/lib/diagnostics.js';
await diagnosticAuthFetch('/api/user/report', {
  method: 'POST',
  body: { reportedUserId: 'test-id', reason: 'test' }
});

// Check if admin token exists
localStorage.getItem('admin_token')
```

## Common Log Prefixes

- `[REPORT-FRONTEND]` - User submitting report in browser
- `[AUTH-MIDDLEWARE]` - Server validating auth token
- `[REPORT]` - Server creating report
- `[MODERATION]` - Server fetching reports for admin
- `[DIAGNOSE]` - Browser API diagnostic tool

## Check These If...

| Issue | Check |
|-------|-------|
| Report shows success but doesn't appear | Backend console for [REPORT] logs |
| Can't sign in | localStorage.getItem('valise_token') should work |
| Admin page empty | Admin token: localStorage.getItem('admin_token') |
| Database empty | `node testReports.js` shows 0 |
| Network error | Check API url: should be `/api/user/report` not `/api/v1/user/report` |

## Commands Reference

```bash
# Check database
node testReports.js

# Quick health check
node quickDebug.js

# Full API test (need tokens)
TEST_USER_TOKEN=xxx TEST_ADMIN_TOKEN=yyy node testReportEndpoint.js

# Check migrations
npx prisma migrate dev

# Restart all
# Terminal 1: cd backend && npx nodemon server.js
# Terminal 2: cd frontend && npm run dev
```

## Log Reading Guide

**Good report submission looks like:**
```
[REPORT-FRONTEND] Starting report for user: xyz
[REPORT-FRONTEND] Response: {success: true, message: "..."}
[AUTH-MIDDLEWARE] ✓ Authenticated user ID: abc
[REPORT] Created Report record: rep-123
```

**Bad report submission looks like:**
```
[REPORT-FRONTEND] Starting report
[REPORT-FRONTEND] Error: [some error message]
// OR: nothing appears at all
```

**Good admin fetch looks like:**
```
[AUTH-MIDDLEWARE] ✓ Authenticated user ID: admin-001
[MODERATION] Found 1 pending reports
```

**Bad admin fetch looks like:**
```
[AUTH-MIDDLEWARE] Error: Invalid token
// OR: nothing appears
```

## Files to Monitor During Testing

1. **Browser Console** (F12 → Console) - See [REPORT-FRONTEND] logs
2. **Backend Terminal** - See [AUTH-MIDDLEWARE] and [REPORT] logs
3. **Admin Terminal** - See when admin page is accessed
4. **Network Tab** (F12 → Network) - See POST and GET requests

## Restart Everything

```powershell
# Kill existing processes first
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Then restart
cd backend ; npx nodemon server.js
```

## Most Common Issues

1. **Token not in localStorage** → User not logged in
2. **No backend logs** → Server isn't receiving request
3. **Report in DB but not in admin page** → Admin GET not working
4. **Reports not in DB** → Database connection or write failing

## Next Step

👉 See `ACTION_PLAN.md` for complete 3-step verification process
