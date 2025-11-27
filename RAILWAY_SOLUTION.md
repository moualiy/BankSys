# BankSystem Railway Deployment - SOLUTION GUIDE

## 🔍 Problem Analysis

### Error Message
```
System.Data.SqlClient.SqlException (0x80131904): A connection was successfully established with the server, 
but then an error occurred during the pre-login handshake. (provider: TCP Provider, error: 35 - An internal exception was caught)
---> System.IO.IOException: Unable to read data from the transport connection: Connection reset by peer.
```

### Root Cause

The issue is **NOT** with your connection string or SQL Server setup. The problem is that:

1. **`System.Data.SqlClient` (the old package you're using) has TLS/SSL compatibility issues** with Railway's TCP proxy
2. Railway uses a proxy (`caboose.proxy.rlwy.net`) that requires proper TLS negotiation
3. The old `System.Data.SqlClient` package doesn't handle modern TLS requirements well in Linux containers

---

## ✅ SOLUTION: Migrate to Microsoft.Data.SqlClient

The fix is to switch from the legacy `System.Data.SqlClient` to the modern `Microsoft.Data.SqlClient` package which has better TLS support and is actively maintained by Microsoft.

---

## 📋 Step-by-Step Fix

### Step 1: Update BankSystem.Data.csproj

**File:** `src/BankSystem.Data/BankSystem.Data.csproj`

Change from:
```xml
<PackageReference Include="System.Data.SqlClient" Version="4.8.6" />
```

To:
```xml
<PackageReference Include="Microsoft.Data.SqlClient" Version="5.2.2" />
```

### Step 2: Update All Using Statements

In ALL files under `BankSystem.Data/DataAccess/`, change:

```csharp
// OLD
using System.Data.SqlClient;

// NEW
using Microsoft.Data.SqlClient;
```

**Files to update:**
- `BankSystem.Data/DataAccess/ClientData.cs`
- `BankSystem.Data/DataAccess/UserData.cs`
- `BankSystem.Data/DataAccess/TransactionData.cs`
- `BankSystem.Data/DataAccess/LoginRegisterData.cs`

### Step 3: Update Connection String for TLS

Update `BankConnection.cs` to add TLS-specific options:

```csharp
// Add to connection string for better compatibility
TrustServerCertificate=True;Encrypt=True;
```

### Step 4: Rebuild and Redeploy

```bash
# Locally test
cd src/BankSystem.Api
dotnet restore
dotnet build

# Push to GitHub (Railway will auto-redeploy)
git add .
git commit -m "Fix: Switch to Microsoft.Data.SqlClient for TLS compatibility"
git push
```

---

## 🔧 Complete Code Changes

### File 1: BankSystem.Data.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Data.SqlClient" Version="5.2.2" />
  </ItemGroup>

</Project>
```

### File 2: BankConnection.cs (Updated)

```csharp
using System;

namespace BankSystem.Data
{
    public static class BankConnection
    {
        private const string DefaultConnectionString = "Server=.;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=True;";
        private static string? _configuredConnectionString;

        public static void Configure(string? connectionString)
        {
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                _configuredConnectionString = connectionString;
            }
        }

        public static string ConnectionString
        {
            get
            {
                return _configuredConnectionString
                    ?? GetEnvironmentConnectionString()
                    ?? BuildFromUrlVariable()
                    ?? BuildFromParts()
                    ?? DefaultConnectionString;
            }
        }

        private static string? GetEnvironmentConnectionString()
        {
            return GetEnv("ConnectionStrings__Default")
                ?? GetEnv("BANKSYSTEM_DB_CONNECTION")
                ?? GetEnv("SQLSERVER_CONNECTION_STRING")
                ?? GetEnv("SQLAZURECONNSTR_DefaultConnection")
                ?? GetEnv("CUSTOMCONNSTR_DefaultConnection");
        }

        private static string? BuildFromUrlVariable()
        {
            var rawUrl = GetEnv("MSSQL_URL")
                ?? GetEnv("SQLSERVER_URL")
                ?? GetEnv("RAILWAY_DATABASE_URL")
                ?? GetEnv("DATABASE_URL")
                ?? GetEnv("DB_URL");

            if (string.IsNullOrWhiteSpace(rawUrl))
            {
                return null;
            }

            if (rawUrl.Contains("Server=", StringComparison.OrdinalIgnoreCase))
            {
                return EnsureTlsOptions(rawUrl);
            }

            if (!Uri.TryCreate(rawUrl, UriKind.Absolute, out var uri))
            {
                return null;
            }

            var userInfoParts = (uri.UserInfo ?? string.Empty).Split(':', 2, StringSplitOptions.TrimEntries);
            var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : null;
            var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : null;
            var database = uri.AbsolutePath.Trim('/');
            var host = uri.Host;
            var port = uri.IsDefaultPort ? null : uri.Port.ToString();

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(database) || string.IsNullOrWhiteSpace(username) || password is null)
            {
                return null;
            }

            var server = string.IsNullOrWhiteSpace(port) ? host : $"{host},{port}";
            return $"Server={server};Database={database};User Id={username};Password={password};Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=30;";
        }

        private static string? BuildFromParts()
        {
            var host = GetEnv("DB_HOST")
                ?? GetEnv("DATABASE_HOST")
                ?? GetEnv("MSSQL_HOST")
                ?? GetEnv("SQLSERVER_HOST")
                ?? GetEnv("RAILWAY_TCP_PROXY_DOMAIN");

            var port = GetEnv("DB_PORT")
                ?? GetEnv("DATABASE_PORT")
                ?? GetEnv("MSSQL_PORT")
                ?? GetEnv("SQLSERVER_PORT")
                ?? GetEnv("RAILWAY_TCP_PROXY_PORT");

            var database = GetEnv("DB_NAME")
                ?? GetEnv("DATABASE_NAME")
                ?? GetEnv("MSSQL_DB")
                ?? GetEnv("SQLSERVER_DB")
                ?? GetEnv("RAILWAY_DATABASE");

            var username = GetEnv("DB_USER")
                ?? GetEnv("DATABASE_USERNAME")
                ?? GetEnv("MSSQL_USER")
                ?? GetEnv("SQLSERVER_USER")
                ?? GetEnv("RAILWAY_USERNAME");

            var password = GetEnv("DB_PASSWORD")
                ?? GetEnv("DATABASE_PASSWORD")
                ?? GetEnv("MSSQL_PASSWORD")
                ?? GetEnv("SQLSERVER_PASSWORD")
                ?? GetEnv("RAILWAY_PASSWORD");

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(database) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return null;
            }

            var server = string.IsNullOrWhiteSpace(port) ? host : $"{host},{port}";
            return $"Server={server};Database={database};User Id={username};Password={password};Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=30;";
        }

        private static string EnsureTlsOptions(string connStr)
        {
            // Ensure TLS options are present
            if (!connStr.Contains("TrustServerCertificate", StringComparison.OrdinalIgnoreCase))
            {
                connStr = connStr.TrimEnd(';') + ";TrustServerCertificate=True;";
            }
            if (!connStr.Contains("Encrypt=", StringComparison.OrdinalIgnoreCase))
            {
                connStr = connStr.TrimEnd(';') + ";Encrypt=True;";
            }
            return connStr;
        }

        private static string? GetEnv(string key) => Environment.GetEnvironmentVariable(key);
    }
}
```

### File 3: Update DataAccess Files

Change the `using` statement at the top of each file:

```csharp
// Replace this:
using System.Data.SqlClient;

// With this:
using Microsoft.Data.SqlClient;
```

---

## ⚙️ Railway Environment Variables

Update your Railway environment variables for the API service:

```
ConnectionStrings__Default=Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=True;Connection Timeout=30;
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

**Key changes to connection string:**
- Added `Encrypt=True` - Required for TLS connection
- Added `TrustServerCertificate=True` - Bypasses certificate validation (OK for dev/internal)
- Added `Connection Timeout=30` - Gives more time for connection establishment

---

## 🧪 Testing the Fix Locally

Before pushing to Railway, test locally with Docker:

```bash
# Build the Docker image
docker build -t banksystem-test .

# Run with the Railway connection string
docker run -p 8080:8080 \
  -e "ConnectionStrings__Default=Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=True;" \
  banksystem-test

# Test the API
curl http://localhost:8080/api/health
curl http://localhost:8080/api/clients
```

---

## 🚀 Deployment Steps

1. **Apply the code changes** (see above)

2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Migrate to Microsoft.Data.SqlClient for Railway TLS compatibility"
   git push origin main
   ```

3. **Railway will auto-redeploy** - Wait for the build to complete

4. **Verify in Railway logs** - Look for:
   ```
   Database connection configured. Server info: Server=caboose.proxy...
   ```

5. **Test the deployed app** - Try the `/api/health` endpoint first

---

## ⚠️ If Still Having Issues

### Option A: Check if Database Exists

Connect to your Railway SQL Server and verify:
```sql
SELECT name FROM sys.databases;
```

If `Bank` database doesn't exist, create it and run the schema script from `RAILWAY_PROBLEM.md`.

### Option B: Check SQL Server Health

In Railway dashboard → SQL Server service → Logs, look for:
```
SQL Server is now ready for client connections
```

If you see memory errors, SQL Server may need more resources.

### Option C: Use Azure SQL Instead

If Railway SQL Server continues to have issues, consider:
1. Create free Azure SQL Database
2. Update `ConnectionStrings__Default` with Azure connection string
3. Azure SQL is more reliable for production workloads

---

## 📊 Comparison: Old vs New Package

| Feature | System.Data.SqlClient | Microsoft.Data.SqlClient |
|---------|----------------------|--------------------------|
| TLS 1.3 Support | ❌ Limited | ✅ Full |
| Active Development | ❌ Maintenance only | ✅ Active |
| Linux Support | ⚠️ Some issues | ✅ Better |
| Azure/Cloud Ready | ⚠️ Basic | ✅ Optimized |
| Railway Compatible | ❌ Proxy issues | ✅ Works |

---

## 📁 Files Changed Summary

| File | Change |
|------|--------|
| `src/BankSystem.Data/BankSystem.Data.csproj` | Update package reference |
| `src/BankSystem.Data/BankConnection.cs` | Add TLS options helper |
| `src/BankSystem.Data/DataAccess/ClientData.cs` | Change using statement |
| `src/BankSystem.Data/DataAccess/UserData.cs` | Change using statement |
| `src/BankSystem.Data/DataAccess/TransactionData.cs` | Change using statement |
| `src/BankSystem.Data/DataAccess/LoginRegisterData.cs` | Change using statement |

---

*Created: November 27, 2025*
*This solution addresses the TLS/SSL handshake error when connecting from Railway's .NET container to SQL Server via their TCP proxy.*
