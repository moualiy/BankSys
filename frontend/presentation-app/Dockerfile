# Multi-stage Dockerfile for React Frontend Application
# Build: docker build -t banksystem-frontend:latest -f frontend/presentation-app/Dockerfile .
# Run: docker run -p 3000:3000 banksystem-frontend:latest

# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY frontend/presentation-app/package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source code
COPY frontend/presentation-app/ .

# Build the React application
RUN npm run build

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:18-alpine

WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve@14

# Copy built application from build stage
COPY --from=build /app/build ./build

# Copy package.json for reference
COPY --from=build /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -q -O- http://localhost:3000 || exit 1

# Serve the application
CMD ["serve", "-s", "build", "-l", "3000"]
