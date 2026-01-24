# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy agent-host app
COPY apps/agent-host ./apps/agent-host

# Install dependencies
RUN npm ci

# Build TypeScript
RUN cd apps/agent-host && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy root package files
COPY package*.json ./
COPY apps/agent-host/package*.json ./apps/agent-host/

# Install production dependencies only
RUN npm ci --only=production && \
    npm ci --prefix apps/agent-host --only=production

# Copy built code from builder
COPY --from=builder /app/apps/agent-host/dist ./apps/agent-host/dist

# Copy environment template (for reference)
COPY apps/agent-host/.env.example ./apps/agent-host/

# Set working directory
WORKDIR /app/apps/agent-host

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
