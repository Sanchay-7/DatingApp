# Dating Application - Full Stack

**Production-Ready** dating application with Next.js frontend and Node.js/Express backend, featuring real-time messaging, online status indicators, and comprehensive AWS deployment configuration.

## 🚀 Status

✅ **Production Ready** - All security hardening, performance optimization, and AWS deployment infrastructure complete.

## 📁 Contents

- `frontend/` — Next.js 16 app (React 19, Tailwind v4, Ably realtime)
- `backend/` — Express 5 API with Prisma ORM, JWT auth, end-to-end encryption
- `nginx/` — Production reverse proxy configuration
- `.github/workflows/` — CI/CD pipeline for AWS ECS deployment
- **Documentation:**
  - `AWS_DEPLOYMENT_GUIDE.md` — Complete AWS setup guide
  - `PRODUCTION_CHECKLIST.md` — Deployment verification checklist
  - `QUICKSTART.md` — 15-minute deployment guide
  - `PRODUCTION_SUMMARY.md` — Complete production features overview
  - `Agile_Project_Report_Phase2.md` — Comprehensive project documentation

## Quick start (development)

Prerequisites:
- Node.js (v18+ recommended)
- PostgreSQL running locally (or an accessible Postgres instance)
- Optional: Cloudinary account, Firebase service account, Ably account

1) Install dependencies

Backend:

```powershell
cd backend
npm install
```

Frontend:

```powershell
cd frontend
npm install
```

2) Environment variables

Create a `.env` file in `backend/` with the required values. Minimal example:

```properties
DATABASE_URL=postgres://postgres:password@localhost:5432/dating?schema=public
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=cloudinary://key:secret@cloudname
ABLY_API_KEY=your_ably_api_key
PORT=5000

# Firebase service account pieces (if used)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PROJECT_ID=...
```

3) Prepare database (Prisma)

From `backend/`:

```powershell
# Generate Prisma client
npx prisma generate

# Push schema to database (safe in development)
npx prisma db push

# Alternatively, if you use migrations, create and apply them
npx prisma migrate dev --name init
```

Notes:
- `db push` will create missing tables to match `prisma/schema.prisma` without creating migration files. Use `migrate dev` if you want migration history.
- If you get errors about existing schema or migration drift, see "Troubleshooting" below.

4) Run servers

Backend (runs on port 5000 by default):

```powershell
cd backend
npm run dev
```

Frontend (Next.js, runs on port 3000):

```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000` for the frontend and the API will be available at `http://localhost:5000`.

## Key backend endpoints

- `POST /api/auth/*` — authentication (signup, signin)
- `POST /api/chat/start` — start a conversation (used when accepting a like)
- `GET /api/chat/token` — get Ably token request for client to authenticate to Ably

## Chat / Ably notes

- Backend uses the Ably Realtime SDK to create token requests for the frontend. The endpoint returns an Ably token request that the client can use to connect.
- The backend creates Conversation, ConversationParticipant and Message records in Postgres (via Prisma). Ensure Prisma client is generated and DB schema is in sync before testing chat flows.

## Troubleshooting

- Prisma: "The table `public.Conversation` does not exist"
	- Run from `backend/`:

```powershell
npx prisma generate
npx prisma db push
```

	- If you use migrations and see drift errors, either reset the dev database (warning: this deletes data):

```powershell
npx prisma migrate reset
```

	- Or read the Prisma docs about baselining an existing DB: https://pris.ly/d/migrate-baseline

- Ably token errors like `callback is not a function`:
	- Ensure the backend uses the callback form of `ablyClient.auth.createTokenRequest()` or wraps it in a Promise that respects the callback signature. The server code in `backend/config/ably.js` and `backend/controllers/chatController.js` already include this handling.

- Database connection issues:
	- Verify `DATABASE_URL` in `backend/.env` and that Postgres is reachable with those credentials.
	- Use the `backend/checkDbTables.js` script to list tables if you need to inspect what exists.

## Testing the chat flow

1. From the frontend UI, accept a like or click the message button to trigger `POST /api/chat/start`.
2. The API should respond with existing or newly created conversation payload.
3. Request an Ably token from `GET /api/chat/token` and connect to Ably channels on the client.

If messages aren't visible, check server logs for errors and verify that `Message`, `Conversation`, and `ConversationParticipant` rows are being created in the Postgres database.

## Useful scripts and files

- `backend/server.js` — Express server entry
- `backend/controllers/chatController.js` — chat endpoints and Ably token handling
- `backend/prisma/schema.prisma` — Prisma schema for database models
- `backend/prisma/migrations/` — optional migration SQL files
- `backend/checkDbTables.js` — utility to list DB tables (created in repo)

## 🚀 Production Deployment

### Quick Deploy (15 minutes)
See **`QUICKSTART.md`** for rapid deployment to AWS.

### Complete Setup
See **`AWS_DEPLOYMENT_GUIDE.md`** for step-by-step AWS infrastructure setup including:
- VPC and networking configuration
- RDS PostgreSQL database
- ECS Fargate cluster
- Application Load Balancer
- Auto-scaling and monitoring

### CI/CD Pipeline
Automated deployment via GitHub Actions:
1. Push to `main` branch
2. Docker images built and pushed to ECR
3. ECS services updated with rolling deployment
4. Database migrations applied automatically

## 🔒 Security Features

- ✅ Helmet.js security headers
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ CORS whitelist
- ✅ HTTPS enforcement
- ✅ JWT authentication
- ✅ End-to-end message encryption (AES-256-GCM)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React auto-escaping)
- ✅ Non-root Docker containers

## ⚡ Performance

- ✅ Response compression (gzip)
- ✅ Database indexes on all high-query columns
- ✅ Connection pooling
- ✅ Image optimization (Next.js WebP/AVIF)
- ✅ Static asset caching (1 year)
- ✅ CDN-ready architecture

## 📊 Monitoring

- ✅ Health check endpoints (`/health`)
- ✅ CloudWatch logs integration
- ✅ HTTP request logging (Morgan)
- ✅ Global error handling
- ✅ Graceful shutdown (SIGTERM)

## 💰 AWS Cost Estimate

**Small deployment (~$130-180/month):**
- ECS Fargate (4 tasks): $80-100
- RDS db.t3.micro: $15-20
- ALB: $20-25
- CloudWatch + Data: $15-30

See `PRODUCTION_SUMMARY.md` for detailed cost breakdown and optimization tips.

## 📞 Support

- **Documentation**: See `AWS_DEPLOYMENT_GUIDE.md`
- **Checklist**: See `PRODUCTION_CHECKLIST.md`
- **Quick Start**: See `QUICKSTART.md`
- **Project Report**: See `Agile_Project_Report_Phase2.md`

---

**Version**: v1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2024
