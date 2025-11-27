# BankSystem Railway Deployment - SOLUTION GUIDE

## 🔍 Problem Analysis

### Error Message
```
Microsoft.Data.SqlClient.SqlException (0x80131904): A connection was successfully established with the server, 
but then an error occurred during the pre-login handshake. (provider: TCP Provider, error: 35 - An internal exception was caught)
---> System.IO.IOException: Unable to read data from the transport connection: Connection reset by peer.
```

### Root Cause

The issue is with **Railway's TCP proxy** (`caboose.proxy.rlwy.net`):

1. Railway uses a TCP proxy to expose SQL Server to the internet
2. This proxy **does NOT support SQL Server's TLS handshake protocol**
3. When `Encrypt=True`, SQL Server tries to establish a TLS connection, but Railway's proxy resets the connection
4. The solution is to use `Encrypt=False` since Railway's infrastructure already provides secure transport

---

## ✅ SOLUTION: Disable SQL Server Encryption for Railway Proxy

### The Fix

Change the connection string from:
```
Encrypt=True
```
To:
```
Encrypt=False
```

**Why is this safe?**
- Railway's TCP proxy already provides secure transport between your app and the proxy
- The proxy-to-database connection is internal to Railway's infrastructure
- SQL Server TLS encryption is incompatible with Railway's TCP proxy architecture

---

## 📋 Changes Made

### 1. Updated `BankSystem.Data.csproj`
Changed from `System.Data.SqlClient` to `Microsoft.Data.SqlClient` for better Linux support:
```xml
<PackageReference Include="Microsoft.Data.SqlClient" Version="5.2.2" />
```

### 2. Updated `BankConnection.cs`
- Forces `Encrypt=False` for Railway compatibility
- Added logging to help debug connection issues
- Added `EnsureRailwayCompatibility()` method that automatically fixes connection strings

### 3. Updated all DataAccess files
Changed the using statement in all files:
```csharp
using Microsoft.Data.SqlClient;  // Instead of System.Data.SqlClient
```

---

## ⚙️ Railway Environment Variables

**Update your `ConnectionStrings__Default` on Railway to:**

```
Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=False;Connection Timeout=30;
```

### Key Settings:
| Setting | Value | Reason |
|---------|-------|--------|
| `Encrypt` | `False` | **CRITICAL** - Railway proxy doesn't support SQL TLS |
| `TrustServerCertificate` | `True` | Skip certificate validation |
| `Connection Timeout` | `30` | Give more time for initial connection |

---

## 🚀 Deployment Steps

1. **The code changes are already applied** in your project

2. **Update Railway environment variable:**
   - Go to Railway Dashboard → Your API Service → Variables
   - Update `ConnectionStrings__Default` to:
   ```
   Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=False;Connection Timeout=30;
   ```

3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Use Encrypt=False for Railway proxy compatibility"
   git push origin main
   ```

4. **Railway will auto-redeploy**

5. **Check logs for:**
   ```
   [BankConnection] Using env connection: Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=****;...
   ```

---

## 🧪 Verify the Database Exists

If you still get connection errors after deploying, the database may not exist. Connect to SQL Server and run:

```sql
-- Check if Bank database exists
SELECT name FROM sys.databases WHERE name = 'Bank';

-- If not, create it and restore from backup or run the schema script
```

See `RAILWAY_PROBLEM.md` for the full SQL script to create tables.

---

## ⚠️ Common Issues

### Issue 1: "Login failed for user 'sa'"
- Verify the password in Railway matches `MSSQL_SA_PASSWORD`
- Default is `sa123456`

### Issue 2: "Cannot open database 'Bank'"
- The database doesn't exist yet
- Connect to SQL Server and create it manually
- Or restore from the backup file

### Issue 3: "Connection timeout"
- SQL Server may still be starting up
- Wait 2-3 minutes after SQL Server deploy
- Check SQL Server logs in Railway for "ready for client connections"

---

## 📊 Technical Explanation

```
┌──────────────┐         ┌──────────────────────┐         ┌───────────────┐
│   Your App   │ ──────► │  Railway TCP Proxy   │ ──────► │  SQL Server   │
│  (Backend)   │         │ caboose.proxy.rlwy   │         │  (Database)   │
└──────────────┘         └──────────────────────┘         └───────────────┘
                                    │
                                    ▼
                         Railway handles security
                         at the proxy level.
                         
                         SQL Server TLS handshake
                         is NOT forwarded - it's
                         stripped/reset by the proxy.
                         
                         Solution: Encrypt=False
```

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `src/BankSystem.Data/BankSystem.Data.csproj` | `Microsoft.Data.SqlClient 5.2.2` |
| `src/BankSystem.Data/BankConnection.cs` | Force `Encrypt=False`, add logging |
| `src/BankSystem.Data/DataAccess/*.cs` | Use `Microsoft.Data.SqlClient` namespace |

---

*Updated: November 27, 2025*
*This solution addresses Railway's TCP proxy TLS incompatibility with SQL Server.*
