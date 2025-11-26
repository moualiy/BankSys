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

# Build the application
RUN dotnet build -c Release -o /app/build

# Publish the application
RUN dotnet publish -c Release -o /app/publish --no-build

# ============================================
# Stage 2: Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Install SQL Server tools (optional, for debugging)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published application from build stage
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080 8443

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
ENTRYPOINT ["dotnet", "BankSystem.Api.dll"]
