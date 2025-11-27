#!/bin/bash

# Railway Database Restore Script
# Purpose: Restore Bank database to Railway SQL Server from backup
# Usage: ./restore-to-railway.sh
# Prerequisites: sqlcmd or mssql-tools installed locally

# Configuration - Update these with your Railway SQL Server details
RAILWAY_HOST="caboose.proxy.rlwy.net"
RAILWAY_PORT="22254"
DB_NAME="Bank"
SA_USER="sa"
SA_PASSWORD="sa123456"
BACKUP_FILE="./db/Bank_backup.bak"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Railway Database Restore Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Host: $RAILWAY_HOST:$RAILWAY_PORT"
echo "Database: $DB_NAME"
echo ""

# Check if sqlcmd is available
if command -v sqlcmd &> /dev/null; then
    SQLCMD="sqlcmd"
elif command -v /opt/mssql-tools18/bin/sqlcmd &> /dev/null; then
    SQLCMD="/opt/mssql-tools18/bin/sqlcmd -C"
elif command -v /opt/mssql-tools/bin/sqlcmd &> /dev/null; then
    SQLCMD="/opt/mssql-tools/bin/sqlcmd"
else
    echo -e "${RED}ERROR: sqlcmd not found. Please install mssql-tools.${NC}"
    echo "On Ubuntu/Debian: curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add - && sudo apt-get update && sudo apt-get install mssql-tools"
    echo "On macOS: brew install mssql-tools18"
    exit 1
fi

echo "Using: $SQLCMD"
echo ""

# Test connection
echo "Testing connection to Railway SQL Server..."
if $SQLCMD -S "$RAILWAY_HOST,$RAILWAY_PORT" -U "$SA_USER" -P "$SA_PASSWORD" -Q "SELECT 1" &>/dev/null; then
    echo -e "${GREEN}Connection successful!${NC}"
else
    echo -e "${RED}Connection failed. Please check your credentials and network.${NC}"
    exit 1
fi

# Check if database exists
echo ""
echo "Checking if database '$DB_NAME' exists..."
DB_EXISTS=$($SQLCMD -S "$RAILWAY_HOST,$RAILWAY_PORT" -U "$SA_USER" -P "$SA_PASSWORD" -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.databases WHERE name='$DB_NAME'" -h -1 -W)

if [ "$DB_EXISTS" -gt "0" ]; then
    echo -e "${YELLOW}Database '$DB_NAME' already exists.${NC}"
    read -p "Do you want to drop and recreate it? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Aborting."
        exit 0
    fi
    
    echo "Dropping existing database..."
    $SQLCMD -S "$RAILWAY_HOST,$RAILWAY_PORT" -U "$SA_USER" -P "$SA_PASSWORD" -Q "
    ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [$DB_NAME];
    "
fi

# Create database with tables
echo ""
echo "Creating database with schema..."

$SQLCMD -S "$RAILWAY_HOST,$RAILWAY_PORT" -U "$SA_USER" -P "$SA_PASSWORD" -i "./docker/mssql-init/02-create-tables.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database schema created successfully!${NC}"
else
    echo -e "${RED}Failed to create database schema.${NC}"
    exit 1
fi

# Show tables
echo ""
echo "Verifying created tables..."
$SQLCMD -S "$RAILWAY_HOST,$RAILWAY_PORT" -U "$SA_USER" -P "$SA_PASSWORD" -d "$DB_NAME" -Q "
SELECT name as TableName FROM sys.tables ORDER BY name
"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your Railway SQL Server is ready."
echo "Connection String:"
echo "Server=$RAILWAY_HOST,$RAILWAY_PORT;Database=$DB_NAME;User Id=$SA_USER;Password=$SA_PASSWORD;TrustServerCertificate=True;Encrypt=False;"
