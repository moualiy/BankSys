# Root Dockerfile for Railway deployment
# Builds the .NET Backend API

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

# Publish the application (includes build)
RUN dotnet publish -c Release -o /app/publish

# ============================================
# Stage 2: Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Copy published application from build stage
COPY --from=build /app/publish .

# Expose port (Railway uses PORT env variable)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

# Run the application
ENTRYPOINT ["dotnet", "BankSystem.Api.dll"]
