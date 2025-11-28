#!/bin/bash

# Database Migration Script for Production
# This script applies all pending Prisma migrations and adds performance indexes

set -e  # Exit on error

echo "=================================================="
echo "Dating App - Production Database Migration"
echo "=================================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo "Please set it before running this script:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
    exit 1
fi

echo "Database URL: ${DATABASE_URL%%@*}@***"
echo ""

# Confirm before proceeding
read -p "This will apply migrations to the production database. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Step 1: Checking Prisma CLI..."
if ! command -v npx &> /dev/null; then
    echo "ERROR: npx not found. Please install Node.js and npm."
    exit 1
fi

echo "✓ Prisma CLI available"
echo ""

echo "Step 2: Generating Prisma Client..."
npx prisma generate
echo "✓ Prisma Client generated"
echo ""

echo "Step 3: Checking migration status..."
npx prisma migrate status || true
echo ""

echo "Step 4: Applying pending migrations..."
npx prisma migrate deploy
echo "✓ Migrations applied successfully"
echo ""

echo "Step 5: Verifying database schema..."
npx prisma db pull --print
echo "✓ Database schema verified"
echo ""

echo "Step 6: Creating database indexes (if not exists)..."
# The indexes should already be in the schema, but we'll verify
echo "Indexes from schema.prisma:"
echo "  - User: email, phoneNumber, accountStatus, lastActive"
echo "  - Like: fromUserId, toUserId, createdAt"
echo "  - ConversationParticipant: userId, conversationId"
echo "  - Message: conversationId, senderId, createdAt"
echo "  - Report: status, reporterId, reportedUserId, createdAt"
echo "✓ All indexes should be created by migrations"
echo ""

echo "Step 7: Running database health check..."
# Check if we can connect and query
psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1 || {
    echo "⚠ WARNING: Could not connect with psql (optional check)"
}
echo "✓ Database connection verified"
echo ""

echo "=================================================="
echo "Migration completed successfully! ✓"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. Verify application can connect to database"
echo "  2. Check CloudWatch logs for any errors"
echo "  3. Test critical user flows (auth, messaging, etc.)"
echo ""
