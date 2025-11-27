# 🚀 Railway Deployment Guide for BankSystem

## Overview

This guide explains how to deploy BankSystem on Railway. The application consists of:
- **Frontend + Backend**: Combined in a single container (served from the root Dockerfile)
- **Database**: SQL Server (you need to provision this separately)

---

## 🔴 IMPORTANT: Database Setup

Railway does **NOT** have a native SQL Server template. You have several options:

### Option 1: Use Azure SQL Database (Recommended for Production)

1. Create an Azure SQL Database at [Azure Portal](https://portal.azure.com)
2. Get the connection string from Azure
3. Set the environment variable on Railway:
   ```
   BANKSYSTEM_DB_CONNECTION=Server=your-server.database.windows.net;Database=Bank;User Id=your-user;Password=your-password;Encrypt=True;TrustServerCertificate=False;
   ```

### Option 2: Use a Third-Party SQL Server Host

Some options:
- **ElephantSQL** (PostgreSQL - would require code changes)
- **PlanetScale** (MySQL - would require code changes)
- **Railway Private Networking** with a custom SQL Server Docker image

### Option 3: Run SQL Server on Railway (Not Recommended)

You can deploy a custom SQL Server container, but:
- It requires a lot of RAM (minimum 2GB)
- Railway's free tier may not support this
- Persistence can be tricky

---

## 🛠️ Railway Environment Variables

Set these environment variables in your Railway project settings:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BANKSYSTEM_DB_CONNECTION` | Full SQL Server connection string | `Server=your-server.database.windows.net;Database=Bank;User Id=sa;Password=YourPass123;Encrypt=True;TrustServerCertificate=True;` |

### Alternative Connection Variables (if not using full connection string)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database server hostname | `your-server.database.windows.net` |
| `DB_PORT` | Database port | `1433` |
| `DB_NAME` | Database name | `Bank` |
| `DB_USER` | Database username | `sa` |
| `DB_PASSWORD` | Database password | `YourSecurePassword123` |

---

## 📋 Step-by-Step Railway Deployment

### Step 1: Create a New Project on Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your BankSystem repository

### Step 2: Configure Environment Variables

1. Click on your deployed service
2. Go to "Variables" tab
3. Add the database connection string:
   ```
   BANKSYSTEM_DB_CONNECTION=your-connection-string-here
   ```

### Step 3: Verify the Deployment

1. Wait for the deployment to complete
2. Click "Generate Domain" to get a public URL
3. Open the URL and test the application

---

## 🗄️ Database Schema Setup

If you're using a fresh database, you need to create the tables. Run these SQL scripts in order:

1. Connect to your database using Azure Data Studio, SSMS, or any SQL client
2. Execute the script in `docker/mssql-init/02-create-tables.sql`

Or manually create the schema:

```sql
-- Create Users table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    UserName NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    PermissionLevel INT NOT NULL DEFAULT 1
);

-- Create Clients table
CREATE TABLE Clients (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0
);

-- Create TransferLog table
CREATE TABLE TransferLog (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FromClientId INT NOT NULL,
    ToClientId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    TransferDate DATETIME NOT NULL DEFAULT GETDATE(),
    AuthorizedByUserId INT NOT NULL,
    FOREIGN KEY (FromClientId) REFERENCES Clients(Id),
    FOREIGN KEY (ToClientId) REFERENCES Clients(Id),
    FOREIGN KEY (AuthorizedByUserId) REFERENCES Users(Id)
);

-- Create LoginRegister table
CREATE TABLE LoginRegister (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    LoginTime DATETIME NOT NULL DEFAULT GETDATE(),
    LogoutTime DATETIME,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Insert a default test user
INSERT INTO Users (FirstName, LastName, Email, UserName, PasswordHash, PermissionLevel)
VALUES ('Test', 'User', 'user5@example.com', 'User5', '5555', 1);
```

---

## 🐛 Troubleshooting

### Error: "A network-related or instance-specific error occurred while establishing a connection to SQL Server"

**Cause**: The application cannot connect to the database.

**Solutions**:
1. Verify `BANKSYSTEM_DB_CONNECTION` is set correctly
2. Check if your database server allows external connections
3. For Azure SQL: Add Railway's IP addresses to the firewall rules (or allow all Azure services)
4. Check the connection string format

### Error: "Cannot connect to API at http://localhost:5168/api"

**Cause**: The frontend is built with localhost as the API URL.

**Solution**: This should be fixed now - the frontend uses relative URLs (`/api`) which work on Railway because both frontend and backend are served from the same container.

### Checking Logs on Railway

1. Go to your Railway project
2. Click on your service
3. Click "Logs" tab to see real-time logs

---

## ✅ Verification Checklist

After deployment, verify these endpoints work:

| Endpoint | Expected Response |
|----------|------------------|
| `https://your-app.railway.app/` | React app loads |
| `https://your-app.railway.app/api/health` | `{"status":"healthy","message":"BankSystem API is running"}` |
| `https://your-app.railway.app/swagger` | Swagger UI appears |

---

## 🔒 Security Notes

1. **Never commit** your connection strings to Git
2. Use Railway's **environment variables** for sensitive data
3. For production, use strong passwords and enable encryption
4. Consider using Azure AD authentication for Azure SQL

---

## 📞 Need Help?

If you're still having issues:
1. Check Railway logs for detailed error messages
2. Verify your database is accessible from external networks
3. Test your connection string locally first
