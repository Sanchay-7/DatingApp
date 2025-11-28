# Production Dockerfile for Backend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Copy dependencies
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=backend:nodejs /app/prisma ./prisma

# Copy application code
COPY --chown=backend:nodejs . .

# Switch to non-root user
USER backend

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
