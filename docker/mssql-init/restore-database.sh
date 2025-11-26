#!/bin/bash

# Database Restoration Script for SQL Server Docker Container
# Purpose: Restore Bank database from backup file
# Usage: Automatically executed when SQL Server container starts
# Author: Bank System Docker Setup
# Date: 2025-11-15

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_FILE="/var/opt/mssql/backup/Bank_backup.bak"
DB_NAME="Bank"
SA_PASSWORD="${MSSQL_SA_PASSWORD:-sa123456}"
SQL_SERVER_HOST="localhost"
SQL_SERVER_PORT="1433"
MAX_RETRIES=60
RETRY_INTERVAL=1
LOG_FILE="/var/opt/mssql/backup/restore.log"

# Helper function to log messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check if SQL Server is ready
wait_for_sql_server() {
    log_info "Waiting for SQL Server to be ready..."
    
    local attempt=1
    while [ $attempt -le $MAX_RETRIES ]; do
        if /opt/mssql-tools/bin/sqlcmd -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "SELECT 1" &>/dev/null; then
            log_success "SQL Server is ready!"
            return 0
        fi
        
        log_info "Attempt $attempt/$MAX_RETRIES: SQL Server not ready yet, retrying in ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
        attempt=$((attempt + 1))
    done
    
    log_error "SQL Server did not become ready within $((MAX_RETRIES * RETRY_INTERVAL)) seconds"
    return 1
}

# Function to check if database exists
database_exists() {
    /opt/mssql-tools/bin/sqlcmd -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "SELECT 1 FROM sys.databases WHERE name='$DB_NAME'" 2>/dev/null | grep -q "1"
    return $?
}

# Function to check if backup file exists
check_backup_file() {
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file not found: $BACKUP_FILE"
        return 1
    fi
    
    local file_size=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    log_info "Backup file found: $BACKUP_FILE (Size: $file_size bytes)"
    return 0
}

# Function to restore database from backup
restore_database() {
    log_info "Starting database restoration from backup file..."
    
    local restore_command="
    RESTORE DATABASE [$DB_NAME] FROM DISK = N'$BACKUP_FILE'
    WITH FILE = 1,
    NOUNLOAD,
    REPLACE,
    NORECOVERY
    GO
    
    RESTORE LOG [$DB_NAME] WITH RECOVERY
    GO
    "
    
    if /opt/mssql-tools/bin/sqlcmd -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "$restore_command"; then
        log_success "Database restoration completed successfully!"
        return 0
    else
        log_error "Database restoration failed!"
        return 1
    fi
}

# Function to create fallback tables (if restoration fails)
create_fallback_tables() {
    log_info "Creating fallback tables..."
    
    local create_tables_script="
    -- Create Bank database if not exists
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$DB_NAME')
    BEGIN
        CREATE DATABASE [$DB_NAME]
    END
    GO
    
    USE [$DB_NAME]
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
        CREATE NONCLUSTERED INDEX IX_Username ON dbo.Users(UserName)
        CREATE NONCLUSTERED INDEX IX_Email ON dbo.Users(Email)
        
        LOG 'Users table created'
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
        CREATE NONCLUSTERED INDEX IX_AccountNumber ON dbo.Clients(AccountNumber)
        
        LOG 'Clients table created'
    END
    GO
    
    -- Create Transactions table
    IF OBJECT_ID('dbo.Transactions', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.Transactions (
            Id INT PRIMARY KEY IDENTITY(1,1),
            ClientId INT NOT NULL,
            TransactionType NVARCHAR(50) NOT NULL,
            Amount DECIMAL(18,2) NOT NULL,
            TransactionDate DATETIME DEFAULT GETDATE(),
            Description NVARCHAR(500),
            FOREIGN KEY (ClientId) REFERENCES dbo.Clients(Id)
        )
        CREATE NONCLUSTERED INDEX IX_ClientId ON dbo.Transactions(ClientId)
        CREATE NONCLUSTERED INDEX IX_TransactionDate ON dbo.Transactions(TransactionDate)
        
        LOG 'Transactions table created'
    END
    GO
    
    -- Create TransferLog table
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
        CREATE NONCLUSTERED INDEX IX_FromClientId ON dbo.TransferLog(FromClientId)
        CREATE NONCLUSTERED INDEX IX_ToClientId ON dbo.TransferLog(ToClientId)
        CREATE NONCLUSTERED INDEX IX_TransferDate ON dbo.TransferLog(TransferDate)
        
        LOG 'TransferLog table created'
    END
    GO
    
    -- Create LoginRegister table
    IF OBJECT_ID('dbo.LoginRegister', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.LoginRegister (
            Id INT PRIMARY KEY IDENTITY(1,1),
            LoginTimestamp DATETIME NOT NULL DEFAULT GETDATE(),
            LoginStatus SMALLINT NOT NULL,
            UserName NVARCHAR(50) NOT NULL
        )
        CREATE NONCLUSTERED INDEX IX_UserName ON dbo.LoginRegister(UserName)
        CREATE NONCLUSTERED INDEX IX_LoginTimestamp ON dbo.LoginRegister(LoginTimestamp)
        
        LOG 'LoginRegister table created'
    END
    GO
    "
    
    if /opt/mssql-tools/bin/sqlcmd -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "$create_tables_script"; then
        log_success "Fallback tables created successfully!"
        return 0
    else
        log_error "Failed to create fallback tables!"
        return 1
    fi
}

# Function to verify database and tables
verify_database() {
    log_info "Verifying database and tables..."
    
    local verification_query="
    SELECT 'Database' as Entity, COUNT(*) as Count FROM sys.databases WHERE name='$DB_NAME'
    UNION ALL
    SELECT 'Users Table', COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='Users'
    UNION ALL
    SELECT 'Clients Table', COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='Clients'
    UNION ALL
    SELECT 'Transactions Table', COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='Transactions'
    UNION ALL
    SELECT 'LoginRegister Table', COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='LoginRegister'
    "
    
    if /opt/mssql-tools/bin/sqlcmd -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -d "$DB_NAME" -Q "$verification_query"; then
        log_success "Database verification completed!"
        return 0
    else
        log_error "Database verification failed!"
        return 1
    fi
}

# Main execution flow
main() {
    log_info "=========================================="
    log_info "Bank System Database Restoration Script"
    log_info "=========================================="
    log_info "Database Name: $DB_NAME"
    log_info "SQL Server: $SQL_SERVER_HOST:$SQL_SERVER_PORT"
    log_info "Backup File: $BACKUP_FILE"
    log_info "=========================================="
    
    # Step 1: Wait for SQL Server to be ready
    if ! wait_for_sql_server; then
        log_error "Failed to connect to SQL Server. Aborting restoration."
        exit 1
    fi
    
    # Step 2: Check if backup file exists
    if ! check_backup_file; then
        log_warning "Backup file check failed. Will attempt to create fallback tables."
    fi
    
    # Step 3: Check if database already exists
    if database_exists; then
        log_warning "Database '$DB_NAME' already exists. Skipping restoration."
        log_info "The existing database will be used. To force restoration, delete the database and restart the container."
        verify_database
        exit 0
    fi
    
    # Step 4: Attempt to restore database from backup
    if check_backup_file && restore_database; then
        log_success "Database restoration completed successfully!"
        sleep 5  # Wait for recovery to complete
        verify_database
        exit 0
    fi
    
    # Step 5: If restoration failed, create fallback tables
    log_warning "Database restoration from backup failed. Creating fallback tables..."
    if create_fallback_tables; then
        log_success "Fallback tables created successfully!"
        verify_database
        log_warning "Database created with empty schema. You may need to manually restore data or seed the database."
        exit 0
    else
        log_error "Failed to create fallback tables. Database initialization failed."
        exit 1
    fi
}

# Run main function
main
