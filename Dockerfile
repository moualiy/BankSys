# Root Dockerfile for Railway deployment
# Builds React Frontend + .NET Backend API
# Railway automatically sets PORT environment variable

# ============================================
# Stage 1: Build React Frontend
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copy package files
COPY frontend/presentation-app/package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source code
COPY frontend/presentation-app/ ./

# Set environment variables for production build
# Use /api for relative path (served from same origin on Railway)
ARG REACT_APP_API_BASE_URL="/api"
ARG REACT_APP_API_URL="/api"
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the React app
RUN npm run build

# ============================================
# Stage 2: Build .NET Backend
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build

WORKDIR /src

# Copy project files
COPY src/BankSystem.Api/BankSystem.Api.csproj ./BankSystem.Api/
COPY src/BankSystem.Business/BankSystem.Business.csproj ./BankSystem.Business/
COPY src/BankSystem.Data/BankSystem.Data.csproj ./BankSystem.Data/

# Restore NuGet packages
WORKDIR /src/BankSystem.Api
RUN dotnet restore

# Copy source code
COPY src/ /src/

# Publish the application (includes build)
RUN dotnet publish -c Release -o /app/publish

# ============================================
# Stage 3: Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published .NET application from build stage
COPY --from=backend-build /app/publish .

# Copy React build output to wwwroot folder
COPY --from=frontend-build /frontend/build ./wwwroot

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (Railway uses PORT env variable)
EXPOSE 8080

# Set default environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080

# Health check - uses PORT env var if set, otherwise 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

# Run the application via entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
