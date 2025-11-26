-- Fallback SQL Script: Create Bank Database and Tables
-- Purpose: Create database schema if backup restoration fails
-- Author: Bank System Docker Setup
-- Date: 2025-11-15

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Bank')
BEGIN
    CREATE DATABASE [Bank]
END
GO

USE [Bank]
GO

-- =====================================================
-- Users Table
-- =====================================================
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
    
    CREATE NONCLUSTERED INDEX IX_Users_Username ON dbo.Users(UserName)
    CREATE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users(Email)
    
    PRINT 'Users table created successfully'
END
GO

-- =====================================================
-- Clients Table
-- =====================================================
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
    
    CREATE NONCLUSTERED INDEX IX_Clients_AccountNumber ON dbo.Clients(AccountNumber)
    
    PRINT 'Clients table created successfully'
END
GO

-- =====================================================
-- Transactions Table
-- =====================================================
IF OBJECT_ID('dbo.Transactions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Transactions (
        Id INT PRIMARY KEY IDENTITY(1,1),
        ClientId INT NOT NULL,
        TransactionType NVARCHAR(50) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        TransactionDate DATETIME DEFAULT GETDATE(),
        Description NVARCHAR(500),
        FOREIGN KEY (ClientId) REFERENCES dbo.Clients(Id) ON DELETE CASCADE
    )
    
    CREATE NONCLUSTERED INDEX IX_Transactions_ClientId ON dbo.Transactions(ClientId)
    CREATE NONCLUSTERED INDEX IX_Transactions_TransactionDate ON dbo.Transactions(TransactionDate)
    
    PRINT 'Transactions table created successfully'
END
GO

-- =====================================================
-- TransferLog Table
-- =====================================================
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
        FOREIGN KEY (FromClientId) REFERENCES dbo.Clients(Id) ON DELETE NO ACTION,
        FOREIGN KEY (ToClientId) REFERENCES dbo.Clients(Id) ON DELETE NO ACTION,
        FOREIGN KEY (AuthorizedByUserId) REFERENCES dbo.Users(Id) ON DELETE NO ACTION
    )
    
    CREATE NONCLUSTERED INDEX IX_TransferLog_FromClientId ON dbo.TransferLog(FromClientId)
    CREATE NONCLUSTERED INDEX IX_TransferLog_ToClientId ON dbo.TransferLog(ToClientId)
    CREATE NONCLUSTERED INDEX IX_TransferLog_AuthorizedByUserId ON dbo.TransferLog(AuthorizedByUserId)
    CREATE NONCLUSTERED INDEX IX_TransferLog_TransferDate ON dbo.TransferLog(TransferDate)
    
    PRINT 'TransferLog table created successfully'
END
GO

-- =====================================================
-- LoginRegister Table
-- =====================================================
IF OBJECT_ID('dbo.LoginRegister', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LoginRegister (
        Id INT PRIMARY KEY IDENTITY(1,1),
        LoginTimestamp DATETIME NOT NULL DEFAULT GETDATE(),
        LoginStatus SMALLINT NOT NULL,
        UserName NVARCHAR(50) NOT NULL
    )
    
    CREATE NONCLUSTERED INDEX IX_LoginRegister_UserName ON dbo.LoginRegister(UserName)
    CREATE NONCLUSTERED INDEX IX_LoginRegister_LoginTimestamp ON dbo.LoginRegister(LoginTimestamp)
    
    PRINT 'LoginRegister table created successfully'
END
GO

-- =====================================================
-- Verify Schema Creation
-- =====================================================
PRINT ''
PRINT 'Database Schema Verification:'
PRINT '============================='

SELECT 
    'Users' as TableName,
    COUNT(*) as ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users'

UNION ALL

SELECT 
    'Clients',
    COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Clients'

UNION ALL

SELECT 
    'Transactions',
    COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Transactions'

UNION ALL

SELECT 
    'TransferLog',
    COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TransferLog'

UNION ALL

SELECT 
    'LoginRegister',
    COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'LoginRegister'

GO

PRINT ''
PRINT 'Database schema initialization completed successfully!'
PRINT ''
