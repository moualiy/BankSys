# Railway SQL Server Deployment

## Option 1: Deploy SQL Server on Railway (Separate Service)

You can deploy SQL Server as a separate service on Railway using the official Microsoft image.

### Steps:

1. **Create a new service in Railway**
   - Go to your Railway project
   - Click "New" → "Database" → "Add from Docker Image"
   - Use image: `mcr.microsoft.com/mssql/server:2022-latest`

2. **Set Environment Variables for SQL Server service:**
   ```
   ACCEPT_EULA=Y
   MSSQL_SA_PASSWORD=YourStrongPassword123!
   MSSQL_PID=Express
   ```

3. **Set the port:**
   - Expose port `1433`

4. **Configure your API service with:**
   ```
   BANKSYSTEM_DB_CONNECTION=Server=<sql-server-service-name>.railway.internal,1433;Database=Bank;User Id=sa;Password=YourStrongPassword123!;Encrypt=False;TrustServerCertificate=True;
   ```
   
   Replace `<sql-server-service-name>` with the actual Railway internal hostname of your SQL Server service.

---

## Option 2: Use Railway Template (Easier)

Railway has community templates. Search for "SQL Server" or "MSSQL" in Railway templates.

---

## Option 3: Use External Database (Recommended for Production)

For production, consider:
- **Azure SQL Database** (free tier available)
- **Amazon RDS SQL Server**
- **Google Cloud SQL**

These provide better reliability, backups, and scaling.

---

## After SQL Server is Running

### Create the Database Schema

Connect to your SQL Server using Azure Data Studio, SSMS, or any SQL client and run the script from `docker/mssql-init/02-create-tables.sql`, or use this quick setup:

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

---

## Troubleshooting

### SQL Server won't start on Railway
- Make sure you have enough RAM (minimum 2GB)
- Check logs for errors
- Railway's hobby plan may not support SQL Server due to memory limits

### Connection timeout
- Use the internal hostname (`.railway.internal`) for service-to-service communication
- Make sure the port 1433 is exposed
