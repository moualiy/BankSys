# Root Dockerfile for Railway deployment
# Builds React Frontend + .NET Backend API

# ============================================
# Stage 1: Build React Frontend
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copy package files
COPY frontend/presentation-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/presentation-app/ ./

# Set environment variables for production build
# Use /api for relative path (served from same origin on Railway)
ENV REACT_APP_API_BASE_URL="/api"
ENV REACT_APP_API_URL="/api"

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

# Copy published .NET application from build stage
COPY --from=backend-build /app/publish .

# Copy React build output to wwwroot folder
COPY --from=frontend-build /frontend/build ./wwwroot

# Expose port (Railway uses PORT env variable)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

# Run the application
ENTRYPOINT ["dotnet", "BankSystem.Api.dll"]
