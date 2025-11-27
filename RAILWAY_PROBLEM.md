# BankSystem Railway Deployment - Problem & Solution Guide

## Current Status

Your app is deployed on Railway but **cannot connect to SQL Server**. Here's everything we've done and what still needs to be fixed.

---

## ✅ What Was Fixed (Code Changes)

### 1. Frontend API URL Fixed
**File:** `Dockerfile`
```dockerfile
# Added these lines to use relative /api path
ENV REACT_APP_API_BASE_URL="/api"
ENV REACT_APP_API_URL="/api"
```

### 2. CORS Policy Fixed
**File:** `src/BankSystem.Api/Program.cs`
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .SetIsOriginAllowed(origin => true) // Allow all origins for Railway
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});
```

### 3. Environment Files Updated
**File:** `.env.production`
```
REACT_APP_API_BASE_URL=/api
REACT_APP_API_URL=/api
```

---

## ❌ What's Still Not Working

### SQL Server Connection Failed

The API cannot connect to SQL Server. Possible reasons:

1. **SQL Server not running properly** - Check if it has enough RAM (needs 2GB+)
2. **Database `Bank` doesn't exist** - Need to create it manually
3. **Tables not created** - Need to run the SQL schema script
4. **Network connectivity** - Private networking may not be working

---

## 🔧 Railway Environment Variables Needed

### For API Service:
```
ConnectionStrings__Default=Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=False;
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

### For SQL Server Service:
```
ACCEPT_EULA=Y
MSSQL_SA_PASSWORD=sa123456
MSSQL_PID=Developer
```

---

## 📋 Steps to Complete Setup

### Step 1: Push Code Changes to GitHub

In VS Code, use Source Control (Ctrl+Shift+G) to commit and push:
```
Commit message: "Fix Railway deployment configuration"
```
Then click "Sync Changes" or push to GitHub.

### Step 2: Check SQL Server Logs

In Railway → SQL Server service → Logs:
- Look for: `SQL Server is now ready for client connections`
- If you see memory errors, Railway's free tier may not support SQL Server

### Step 3: Create Database and Tables

Connect to SQL Server using Azure Data Studio or SSMS:
- **Server:** `caboose.proxy.rlwy.net,22254`
- **Username:** `sa`
- **Password:** `sa123456`

Then run this SQL:

```sql
-- Create database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Bank')
BEGIN
    CREATE DATABASE [Bank]
END
GO

USE [Bank]
GO

-- Users Table
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        UserName NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        PermissionLevel INT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    )
END
GO

-- Clients Table
IF OBJECT_ID('dbo.Clients', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Clients (
        Id INT PRIMARY KEY IDENTITY(1,1),
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100),
        PhoneNumber NVARCHAR(20),
        AccountNumber NVARCHAR(50) NOT NULL UNIQUE,
        Balance DECIMAL(18,2) DEFAULT 0,
        Status INT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    )
END
GO

-- TransferLog Table
IF OBJECT_ID('dbo.TransferLog', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TransferLog (
        Id INT PRIMARY KEY IDENTITY(1,1),
        FromClientId INT NOT NULL,
        ToClientId INT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        AuthorizedByUserId INT NOT NULL,
        TransferDate DATETIME DEFAULT GETDATE(),
        Status NVARCHAR(50) DEFAULT 'Success',
        Notes NVARCHAR(500),
        FOREIGN KEY (FromClientId) REFERENCES dbo.Clients(Id),
        FOREIGN KEY (ToClientId) REFERENCES dbo.Clients(Id),
        FOREIGN KEY (AuthorizedByUserId) REFERENCES dbo.Users(Id)
    )
END
GO

-- LoginRegister Table
IF OBJECT_ID('dbo.LoginRegister', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LoginRegister (
        Id INT PRIMARY KEY IDENTITY(1,1),
        LoginTimestamp DATETIME NOT NULL DEFAULT GETDATE(),
        LoginStatus SMALLINT NOT NULL,
        UserName NVARCHAR(50) NOT NULL
    )
END
GO

-- Insert test user (User5 / 5555)
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserName = 'User5')
BEGIN
    INSERT INTO dbo.Users (FirstName, LastName, Email, UserName, PasswordHash, PermissionLevel)
    VALUES ('Test', 'User', 'user5@example.com', 'User5', '5555', 1)
END
GO

-- Insert test clients
IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE AccountNumber = 'ACC001')
BEGIN
    INSERT INTO dbo.Clients (FirstName, LastName, Email, PhoneNumber, AccountNumber, Balance)
    VALUES 
        ('John', 'Doe', 'john@example.com', '123-456-7890', 'ACC001', 1000.00),
        ('Jane', 'Smith', 'jane@example.com', '098-765-4321', 'ACC002', 2500.50)
END
GO

PRINT 'Database setup completed!'
```

### Step 4: Redeploy API Service

After setting up the database, redeploy your API service in Railway.

---

## ⚠️ Important Notes

1. **Railway Hobby Plan Limitation**: SQL Server needs 2GB+ RAM. If Railway's free tier doesn't support it, consider:
   - Upgrading to Railway Pro
   - Using **Azure SQL Database** (free tier available)
   - Using **PostgreSQL** on Railway (would need code changes)

2. **Files Created**:
   - `RAILWAY_DEPLOYMENT.md` - General Railway guide
   - `RAILWAY_SQLSERVER_SETUP.md` - SQL Server setup guide
   - `RAILWAY_PROBLEM.md` - This file

3. **Test Credentials**:
   - Username: `User5`
   - Password: `5555`

---

## 🔄 Alternative: Use Azure SQL (Free)

If Railway SQL Server keeps failing, create a free Azure SQL Database:

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a free SQL Database
3. Get the connection string
4. Update `ConnectionStrings__Default` in Railway with the Azure connection string

---

## 🧪 Testing Connection

Try connecting to SQL Server from your local machine:

### Using Azure Data Studio:
1. Download [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download)
2. New Connection:
   - Server: `caboose.proxy.rlwy.net,22254`
   - Authentication: SQL Login
   - User: `sa`
   - Password: `sa123456`
   - Trust Server Certificate: Yes

### Using Command Line (sqlcmd):
```bash
sqlcmd -S caboose.proxy.rlwy.net,22254 -U sa -P sa123456
```

If you can connect locally but Railway can't, it's likely a Railway internal networking issue.

---

## 📞 Next Steps

1. **First**: Check if you can connect to SQL Server from your local machine
2. **If yes**: Run the SQL script to create database and tables
3. **If no**: SQL Server may not be running - check Railway logs
4. **Alternative**: Use Azure SQL Database instead

---

## 🐛 Error Messages Encountered

### Error 1: Frontend API URL
```
Cannot connect to API at http://localhost:5168/api
```
**Status**: ✅ Fixed by setting `REACT_APP_API_BASE_URL=/api` in Dockerfile

### Error 2: SQL Server Connection
```
A network-related or instance-specific error occurred while establishing a connection to SQL Server
(provider: TCP Provider, error: 40 - Could not open a connection to SQL Server)
```
**Status**: ❌ Still occurring - need to verify SQL Server is running and database exists

---

*Last updated: November 27, 2025*
