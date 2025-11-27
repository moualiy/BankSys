#!/bin/bash
set -e

# Railway sets PORT environment variable
# However, if PORT is 1433 (SQL Server default), ignore it as that's likely a misconfiguration
# We need to set ASPNETCORE_URLS accordingly
if [ -n "$PORT" ] && [ "$PORT" != "1433" ]; then
    export ASPNETCORE_URLS="http://+:$PORT"
    echo "Starting on port $PORT (from Railway PORT variable)"
elif [ -n "$RAILWAY_PORT" ]; then
    export ASPNETCORE_URLS="http://+:$RAILWAY_PORT"
    echo "Starting on port $RAILWAY_PORT (from RAILWAY_PORT variable)"
else
    # Default to 8080 for web traffic
    export PORT=8080
    export ASPNETCORE_URLS="http://+:8080"
    echo "Starting on port 8080 (default web port)"
fi

echo "ASPNETCORE_URLS=$ASPNETCORE_URLS"
echo "ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-Production}"

# Log connection info (masked)
if [ -n "$ConnectionStrings__Default" ]; then
    echo "Database connection configured via ConnectionStrings__Default"
fi

# Start the application
exec dotnet BankSystem.Api.dll
