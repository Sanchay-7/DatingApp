This repository contains a full-stack dating app (Next.js frontend + Node/Express backend) used for development and testing.

## Contents

- `frontend/` — Next.js app (React + app router)
- `backend/` — Express API server with Prisma ORM, Ably realtime integration and encryption utilities

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

## Next steps / Recommendations

- Add CI scripts to run `npx prisma migrate deploy` for production deployments.
- Add a small integration test that calls `POST /api/chat/start` and verifies DB changes.
- Consider adding a lightweight README in `backend/` with environment variable templates (`.env.example`).

---

If you want, I can also:
- add a `backend/.env.example` with placeholders,
- run the database checks and apply the migration locally (I can run commands if you want me to), or
- add a tiny integration test that validates the chat start flow.

Tell me which of those you'd like next.
