# Visual Debugging Guide

## 🔄 Report Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  USER SUBMITS REPORT FROM DASHBOARD                             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Frontend Sends    │
                    │ POST to           │
                    │ /api/user/report  │
                    │ with token        │
                    └─────────┬─────────┘
                              │
                ┌─────────────┴──────────────────┐
                │                                │
     ✅ Shows "[REPORT-FRONTEND]"       ❌ No logs?
       logs in browser console            Check: localStorage.getItem
                │                          ('valise_token')
                │
        ┌───────▼───────────┐
        │ Backend receives  │
        │ POST request      │
        │ [AUTH-MIDDLEWARE] │
        │ logs appear       │
        └───────┬───────────┘
                │
     ✅ "[AUTH-MIDDLEWARE]     ❌ No logs?
       ✓ Authenticated"           Check: Network tab
                │                  POST request status
                │
        ┌───────▼───────────────────┐
        │ Backend creates Report    │
        │ record                    │
        │ [REPORT] logs appear      │
        └───────┬───────────────────┘
                │
     ✅ "[REPORT]            ❌ No logs?
       Created Report"          Check: Backend errors
                │
        ┌───────▼───────────┐
        │ Report saved to   │
        │ database          │
        └───────┬───────────┘
                │
    ✅ testReports.js    ❌ 0 reports?
      shows pending         Check: Prisma
                            migrations
                │
        ┌───────▼────────────┐
        │ Admin signs in     │
        │ Goes to            │
        │ /admin/moderation  │
        └───────┬────────────┘
                │
        ┌───────▼────────────────┐
        │ Frontend fetches       │
        │ GET /api/v1/admin/     │
        │ moderation with token  │
        │ [MODERATION] logs      │
        └───────┬────────────────┘
                │
   ✅ "[MODERATION]        ❌ No logs?
     Found N reports"        Check: Admin
                │             token
                │
        ┌───────▼────────┐
        │ Report appears │
        │ in admin page  │
        │ list           │
        └────────────────┘
                │
        ✅ SUCCESS!
```

---

## 📊 Logging Location Map

```
                    Frontend                      Backend
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   Browser Console (F12 → Console)                         │
│   ├─ [REPORT-FRONTEND] ...                                │
│   └─ Other app logs                                       │
│                                                           │
│                    HTTP POST ↓                            │
│                    /api/user/report                       │
│                                                           │
│                                    Terminal/Console       │
│                                    ├─ [AUTH-MIDDLEWARE]   │
│                                    ├─ [REPORT] ...        │
│                                    └─ Other logs          │
│                                                           │
│                    HTTP Response ↑                        │
│                                                           │
│   Browser Console (F12 → Network Tab)                     │
│   └─ Shows POST request status                            │
│                                                           │
│                                    Database               │
│                                    (PostgreSQL)           │
│                                    └─ Report record       │
│                                       saved               │
│                                                           │
│   Admin signs in...                                       │
│   Goes to /admin/moderation                               │
│                                                           │
│   Browser Console (F12 → Console)                         │
│   └─ Auto-refresh logs                                    │
│                                                           │
│                    HTTP GET ↓                             │
│                    /api/v1/admin/moderation               │
│                                                           │
│                                    Terminal/Console       │
│                                    ├─ [AUTH-MIDDLEWARE]   │
│                                    ├─ [MODERATION] ...    │
│                                    └─ Other logs          │
│                                                           │
│                    HTTP Response ↑                        │
│   Reports appear in UI                                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Diagnostic Grid

```
WHAT TO CHECK                    WHERE TO LOOK           EXPECTED
─────────────────────────────────────────────────────────────────
Token exists?                    Browser console:        (not empty)
                                localStorage
                                .getItem('valise_token')

Request sent?                    F12 → Network tab       POST /api/user/report
                                                         (filter: XHR)

Auth working?                    Backend console         [AUTH-MIDDLEWARE]
                                after submitting         ✓ Authenticated

Report created?                  Backend console         [REPORT] Created
                                after submitting         Report record: ...

Report in DB?                    Terminal:               Pending reports: 1+
                                node testReports.js

Admin page loads?                Go to                   /admin/moderation
                                /admin/moderation

Reports visible?                 Admin page list          Report appears
                                                         within 10 seconds

GET request sent?                F12 → Network tab       GET /api/v1/admin/
                                (filter: XHR)            moderation

Admin auth working?              Backend console         [AUTH-MIDDLEWARE]
                                when refreshing          ✓ Authenticated
```

---

## 🛠️ Tool Selector Guide

```
I want to...                          USE THIS TOOL              LOCATION

Submit a report manually              Dashboard UI               frontend/...
through the app                       or any profile page

Check if token exists                 Browser console:           F12 → Console
                                     localStorage
                                     .getItem()

Test API call from browser            diagnosticAuthFetch()      frontend/src/lib/
                                                                diagnostics.js

Check if reports are in DB            node testReports.js        backend/

See full health status                node quickDebug.js         backend/

Test API from command line            node testReportEndpoint    backend/
(with tokens)                         .js

See all backend logs                  Terminal window            (automatic)
                                     where nodemon running

See all frontend errors/logs          F12 → Console              (automatic)

See HTTP requests/responses           F12 → Network              (automatic)

Inspect database directly             Use any SQL tool           PostgreSQL

Test admin moderation fetch           Go to                      localhost:3000/
                                     /admin/moderation          admin/moderation
```

---

## 📋 Checkpoint Checklist

```
STAGE 1: SETUP
───────────────────────────────────────────────────
❌ Backend not running
   └─ Run: cd backend && npx nodemon server.js

❌ Frontend not running
   └─ Run: cd frontend && npm run dev

❌ Can't open localhost:3000
   └─ Check if frontend is running, wait 30s


STAGE 2: AUTHENTICATION
───────────────────────────────────────────────────
❌ Not signed in
   └─ Go to sign in page, create account

❌ Token not in localStorage
   └─ Check browser console: localStorage.getItem('valise_token')
   └─ If empty, sign in again

❌ [AUTH-MIDDLEWARE] not appearing
   └─ Check Network tab for POST request status
   └─ If 401, token is invalid


STAGE 3: REPORT SUBMISSION
───────────────────────────────────────────────────
❌ Can't find profile to report
   └─ Navigate to discovery/recommendation page

❌ Report button not working
   └─ Check browser console for errors

❌ Success message not showing
   └─ Wait 2 seconds, check for error message

❌ No [REPORT-FRONTEND] logs
   └─ Check Network tab for POST status
   └─ If 401, re-login


STAGE 4: VERIFICATION
───────────────────────────────────────────────────
❌ No [REPORT] logs in backend
   └─ Request might not be reaching backend
   └─ Check Network tab, URL, CORS

❌ No reports in testReports.js
   └─ Database isn't saving
   └─ Run: npx prisma migrate dev

❌ Reports in DB but not in admin page
   └─ Admin fetch not working
   └─ Check admin_token: localStorage.getItem('admin_token')


STAGE 5: ADMIN PAGE
───────────────────────────────────────────────────
❌ Can't sign in as admin
   └─ Check if account is admin (in database)

❌ Can't access /admin/moderation
   └─ Check if logged in as admin

❌ Page loads but shows nothing
   └─ Open Network tab, check GET request

❌ Shows old reports, not new ones
   └─ Click Refresh button (should auto-refresh every 10s)
```

---

## 🚨 Error Response Decoder

```
RESPONSE STATUS                MEANING               WHAT TO CHECK
─────────────────────────────────────────────────────────────────
200 / 201 ✅                  Success               Report was saved

400 ❌ Bad Request             Input invalid         Reason/reportedUserId

401 ❌ Unauthorized            Token invalid/        localStorage token,
                              expired               sign in again

403 ❌ Forbidden               Permission denied     User/admin role

404 ❌ Not Found               Endpoint doesn't      URL path,
                              exist                  route registration

500 ❌ Server Error            Backend crashed       Backend console,
                                                    error logs
```

---

## 🔍 What Each Log Means

```
FRONTEND LOGS
───────────────────────────────────────────────────
[REPORT-FRONTEND] Starting report...
  └─ User clicked report button

[REPORT-FRONTEND] Reason: <text>
  └─ Reason selected/entered

[REPORT-FRONTEND] Payload: {...}
  └─ About to send this data

[REPORT-FRONTEND] Response: {success: true}
  └─ Server accepted the report ✅

[REPORT-FRONTEND] Error: ...
  └─ API call failed ❌


BACKEND LOGS
───────────────────────────────────────────────────
[AUTH-MIDDLEWARE] Incoming request to POST...
  └─ Request received by backend

[AUTH-MIDDLEWARE] Token found...
  └─ Auth header exists

[AUTH-MIDDLEWARE] ✓ Authenticated user ID: xxx
  └─ Token is valid ✅

[AUTH-MIDDLEWARE] No token provided
  └─ Request missing auth header ❌

[REPORT] User xxx reporting user yyy for: ...
  └─ Starting to process report

[REPORT] Created Report record: ...
  └─ Saved to database ✅

[REPORT] Success: Report submitted...
  └─ All done ✅

[REPORT] Error...
  └─ Something went wrong ❌


ADMIN LOGS
───────────────────────────────────────────────────
[MODERATION] Fetching pending reports...
  └─ Admin page requested the list

[MODERATION] Found N pending reports
  └─ Database query returned N results
```

---

## ⏱️ Timeline: What Should Happen

```
TIME  ACTION                          WHAT TO EXPECT
────────────────────────────────────────────────────────────────
0s    User clicks Report              ✓ Button disabled (shows loading)

0s    Frontend sends POST             ✓ Network tab shows request

0.1s  Backend receives POST           ✓ [AUTH-MIDDLEWARE] logs appear

0.2s  Backend validates token         ✓ [AUTH-MIDDLEWARE] ✓ Authenticated

0.3s  Backend creates Report          ✓ [REPORT] logs appear

0.5s  Frontend receives response      ✓ Success message appears

0.6s  Database transaction committed  ✓ Data persists

5s    Admin checks moderation page    ✗ (Usually 10s auto-refresh)

10s   Auto-refresh triggers           ✓ New report appears in list

Or:   Admin clicks Refresh button     ✓ New report appears immediately
```

---

## 📱 Mobile Debugging (Browser DevTools)

```
F12 KEY                     WHAT IT SHOWS
─────────────────────────────────────────────────
Console                     App logs + errors
                           Look for: [REPORT-FRONTEND]

Network                     All HTTP requests/responses
                           Look for: POST /api/user/report
                           Status should be 200 or 201

Storage → Local Storage     Saved tokens
                           Look for: valise_token
                           Should be non-empty JWT

Application → Network       Connection info
                           Should show connected
```

---

## 🎓 Read This If...

| Situation | Read This Section | Then |
|-----------|-------------------|------|
| Nothing works | SYSTEM_SUMMARY.md | ACTION_PLAN.md |
| Confused what to test | QUICK_REFERENCE.md | DEBUGGING_TOOLS.md |
| Got specific error | DEBUG_GUIDE.md | "Potential Issues" table |
| Want to understand flow | This file (Visual Guide) | Actual code files |
| Need specific command | QUICK_REFERENCE.md | Commands table |

---

**Next Step:** Open `ACTION_PLAN.md` and follow the 3-step verification! 👉
