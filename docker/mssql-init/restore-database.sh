#!/bin/bash

# Database Restoration Script for SQL Server Docker Container
# Purpose: Restore Bank database from backup file
# Usage: Automatically executed when SQL Server container starts
# Author: Bank System Docker Setup
# Date: 2025-11-15
# Updated: 2025-11-27 for Railway compatibility

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_FILE="/var/opt/mssql/backup/Bank_backup.bak"
DB_NAME="${SQL_DATABASE:-Bank}"
SA_PASSWORD="${MSSQL_SA_PASSWORD:-sa123456}"
SQL_SERVER_HOST="${SQL_SERVER_HOST:-localhost}"
SQL_SERVER_PORT="${SQL_SERVER_PORT:-1433}"
MAX_RETRIES=60
RETRY_INTERVAL=2
LOG_FILE="/var/opt/mssql/backup/restore.log"

# Determine which sqlcmd to use (mssql-tools or mssql-tools18)
SQLCMD=""
if [ -f "/opt/mssql-tools18/bin/sqlcmd" ]; then
    SQLCMD="/opt/mssql-tools18/bin/sqlcmd -C"
elif [ -f "/opt/mssql-tools/bin/sqlcmd" ]; then
    SQLCMD="/opt/mssql-tools/bin/sqlcmd"
else
    echo "ERROR: sqlcmd not found!"
    exit 1
fi

# Helper function to log messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[INFO] $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[SUCCESS] $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[WARNING] $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[ERROR] $1"
}

# Function to check if SQL Server is ready
wait_for_sql_server() {
    log_info "Waiting for SQL Server to be ready..."
    log_info "Using sqlcmd: $SQLCMD"
    
    local attempt=1
    while [ $attempt -le $MAX_RETRIES ]; do
        if $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "SELECT 1" &>/dev/null; then
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
    $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "SELECT 1 FROM sys.databases WHERE name='$DB_NAME'" 2>/dev/null | grep -q "1"
    return $?
}

# Function to check if backup file exists
check_backup_file() {
    if [ ! -f "$BACKUP_FILE" ]; then
        log_warning "Backup file not found: $BACKUP_FILE"
        return 1
    fi
    
    local file_size=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE" 2>/dev/null || echo "unknown")
    log_info "Backup file found: $BACKUP_FILE (Size: $file_size bytes)"
    return 0
}

# Function to get logical file names from backup
get_logical_names() {
    log_info "Getting logical file names from backup..."
    $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "RESTORE FILELISTONLY FROM DISK = N'$BACKUP_FILE'" 2>/dev/null
}

# Function to restore database from backup with dynamic file mapping
restore_database() {
    log_info "Starting database restoration from backup file..."
    
    # Get the logical names from the backup file
    local fileinfo=$($SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "SET NOCOUNT ON; RESTORE FILELISTONLY FROM DISK = N'$BACKUP_FILE'" -h -1 -W 2>/dev/null)
    
    # Parse logical names (first two lines typically contain data and log file info)
    local data_logical=$(echo "$fileinfo" | head -1 | awk '{print $1}')
    local log_logical=$(echo "$fileinfo" | sed -n '2p' | awk '{print $1}')
    
    if [ -z "$data_logical" ]; then
        data_logical="Bank"
    fi
    if [ -z "$log_logical" ]; then
        log_logical="Bank_log"
    fi
    
    log_info "Data file logical name: $data_logical"
    log_info "Log file logical name: $log_logical"
    
    # Restore command with MOVE to standard SQL Server paths
    local restore_command="
    RESTORE DATABASE [$DB_NAME] FROM DISK = N'$BACKUP_FILE'
    WITH FILE = 1,
    MOVE N'$data_logical' TO N'/var/opt/mssql/data/${DB_NAME}.mdf',
    MOVE N'$log_logical' TO N'/var/opt/mssql/data/${DB_NAME}_log.ldf',
    NOUNLOAD,
    REPLACE,
    STATS = 10
    "
    
    log_info "Executing restore command..."
    
    if $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "$restore_command"; then
        log_success "Database restoration completed successfully!"
        return 0
    else
        log_error "Database restoration failed! Trying alternative method..."
        
        # Try simpler restore without MOVE
        local simple_restore="RESTORE DATABASE [$DB_NAME] FROM DISK = N'$BACKUP_FILE' WITH REPLACE, RECOVERY"
        if $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "$simple_restore"; then
            log_success "Database restoration completed with simple method!"
            return 0
        fi
        
        return 1
    fi
}

# Function to create fallback tables (if restoration fails)
create_fallback_tables() {
    log_info "Creating fallback database and tables..."
    
    local create_db="
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$DB_NAME')
    BEGIN
        CREATE DATABASE [$DB_NAME]
    END
    "
    
    $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "$create_db"
    
    # Run the SQL script if it exists
    if [ -f "/docker-entrypoint-initdb.d/02-create-tables.sql" ]; then
        log_info "Running table creation script..."
        $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -d "$DB_NAME" -i "/docker-entrypoint-initdb.d/02-create-tables.sql"
        return $?
    fi
    
    log_warning "Table creation script not found, database created empty."
    return 0
}

# Function to verify database and tables
verify_database() {
    log_info "Verifying database and tables..."
    
    local verification_query="
    USE [$DB_NAME];
    SELECT 'Database' as Entity, name as Name FROM sys.databases WHERE name='$DB_NAME'
    UNION ALL
    SELECT 'Table', name FROM sys.tables
    "
    
    if $SQLCMD -S $SQL_SERVER_HOST,$SQL_SERVER_PORT -U sa -P "$SA_PASSWORD" -Q "$verification_query"; then
        log_success "Database verification completed!"
        return 0
    else
        log_warning "Database verification encountered issues."
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
    
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
    
    # Step 1: Wait for SQL Server to be ready
    if ! wait_for_sql_server; then
        log_error "Failed to connect to SQL Server. Aborting restoration."
        exit 1
    fi
    
    # Step 2: Check if database already exists
    if database_exists; then
        log_warning "Database '$DB_NAME' already exists. Skipping restoration."
        log_info "The existing database will be used."
        verify_database
        exit 0
    fi
    
    # Step 3: Check if backup file exists and attempt restore
    if check_backup_file; then
        log_info "Attempting database restoration from backup..."
        if restore_database; then
            log_success "Database restoration completed successfully!"
            sleep 5  # Wait for recovery to complete
            verify_database
            exit 0
        fi
    fi
    
    # Step 4: If restoration failed or no backup, create fallback tables
    log_warning "Database restoration from backup failed or backup not found. Creating fallback schema..."
    if create_fallback_tables; then
        log_success "Fallback database created successfully!"
        verify_database
        log_warning "Database created with empty schema. You may need to manually import data."
        exit 0
    else
        log_error "Failed to create fallback database. Database initialization failed."
        exit 1
    fi
}

# Run main function
main
