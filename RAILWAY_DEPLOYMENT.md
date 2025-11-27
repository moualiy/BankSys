# 🚀 Railway Deployment Guide for BankSystem

## Overview

This guide explains how to deploy BankSystem on Railway. The application consists of:
- **Frontend + Backend**: Combined in a single container (served from the root Dockerfile)
- **Database**: SQL Server hosted on Railway

---

## 📋 Quick Start Deployment

### Your Current Railway Configuration

Based on your `.env` configuration, your Railway SQL Server is already set up:

| Setting | Value |
|---------|-------|
| **SQL Server Host** | `caboose.proxy.rlwy.net` |
| **SQL Server Port** | `22254` |
| **Database** | `Bank` |
| **User** | `sa` |
| **Password** | `sa123456` |

---

## 🛠️ Railway Environment Variables

Ensure these environment variables are set in your Railway project:

```env
# Required
ConnectionStrings__Default=Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=False;Connection Timeout=30;

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# React App
REACT_APP_API_BASE_URL=/api
REACT_APP_API_URL=/api

# SQL Server (if running SQL Server container on Railway)
ACCEPT_EULA=Y
MSSQL_SA_PASSWORD=sa123456
MSSQL_PID=Developer
```

---

## 📋 Step-by-Step Railway Deployment

### Step 1: Set Up Database on Railway

Your SQL Server is already configured at `caboose.proxy.rlwy.net:22254`. If you need to create the database schema:

**Option A: Using the restore script (from local machine)**
```bash
# Make script executable
chmod +x restore-to-railway.sh

# Run the script
./restore-to-railway.sh
```

**Option B: Manual SQL execution**
1. Connect to your Railway SQL Server using Azure Data Studio or SSMS:
   - Server: `caboose.proxy.rlwy.net,22254`
   - User: `sa`
   - Password: `sa123456`
2. Run the script `docker/mssql-init/02-create-tables.sql`

### Step 2: Deploy Application on Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your BankSystem repository
4. Railway will automatically detect the `Dockerfile` and build

### Step 3: Configure Environment Variables

1. Click on your deployed service
2. Go to "Variables" tab
3. Add all the environment variables listed above

### Step 4: Generate Domain

1. Go to "Settings" tab
2. Click "Generate Domain" under Networking
3. Your app will be available at `https://your-app.railway.app`

---

## 🗄️ Database Schema Setup

The database schema is defined in `docker/mssql-init/02-create-tables.sql`. It creates:

- **Users** - System users for authentication
- **Clients** - Bank clients/customers
- **Transactions** - Transaction records
- **TransferLog** - Transfer history between clients
- **LoginRegister** - Login audit trail

### Quick Schema Creation

```sql
-- Connect to your Railway SQL Server and run:

-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Bank')
BEGIN
    CREATE DATABASE [Bank]
END
GO

USE [Bank]
GO

-- Create Users table
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

-- Create Clients table
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

-- See docker/mssql-init/02-create-tables.sql for full schema
```

---

## ✅ Verification Endpoints

After deployment, test these endpoints:

| Endpoint | Expected Response |
|----------|------------------|
| `https://your-app.railway.app/` | React app loads |
| `https://your-app.railway.app/api/health` | `{"status":"healthy","message":"BankSystem API is running"}` |
| `https://your-app.railway.app/swagger` | Swagger UI appears |
| `https://your-app.railway.app/api/users` | List of users (JSON) |

---

## 🐛 Troubleshooting

### Error: "A network-related or instance-specific error occurred"

**Solutions**:
1. Verify the connection string format: `Server=host,port;Database=name;...`
2. Check that Railway SQL Server is running
3. Verify credentials are correct

### Error: Cannot connect to database

**Check Railway logs**:
1. Go to your Railway project
2. Click on your service → "Logs" tab
3. Look for connection errors

### App loads but API calls fail

**Solutions**:
1. Ensure `REACT_APP_API_BASE_URL=/api` is set
2. Check CORS settings in the backend
3. Verify the backend is running on port 8080

---

## 🔒 Security Notes

1. **Never commit** connection strings to Git
2. Use Railway's **environment variables** for sensitive data
3. For production, use stronger passwords
4. Consider enabling SQL Server encryption

---

## 📁 File Structure

```
BankSystem/
├── Dockerfile              # Main deployment Dockerfile (Frontend + Backend)
├── railway.json            # Railway configuration
├── docker-compose.yml      # Local development with SQL Server
├── restore-to-railway.sh   # Database setup script
├── src/
│   └── BankSystem.Api/     # .NET Backend
├── frontend/
│   └── presentation-app/   # React Frontend
└── docker/
    └── mssql-init/
        ├── restore-database.sh
        └── 02-create-tables.sql
```

---

## 🚀 Deployment Commands

**Local Development:**
```bash
# Start all services (SQL Server + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

**Build for Railway locally:**
```bash
# Build the combined image
docker build -t banksystem:latest .

# Run locally
docker run -p 8080:8080 \
  -e "ConnectionStrings__Default=Server=caboose.proxy.rlwy.net,22254;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=False;" \
  banksystem:latest
```
