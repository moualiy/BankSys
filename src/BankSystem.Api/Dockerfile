# Multi-stage Dockerfile for BankSystem.Api (.NET 9.0)
# Build: docker build -t banksystem-api:latest -f src/BankSystem.Api/Dockerfile .
# Run: docker run -p 8080:8080 -e ConnectionStrings__Default="..." banksystem-api:latest

# ============================================
# Stage 1: Build
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

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

# Build and publish the application
RUN dotnet publish -c Release -o /app/publish

# ============================================
# Stage 2: Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application from build stage
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
ENTRYPOINT ["dotnet", "BankSystem.Api.dll"]
