#!/bin/bash
set -e

# Railway sets PORT environment variable
# We need to set ASPNETCORE_URLS accordingly
if [ -n "$PORT" ]; then
    export ASPNETCORE_URLS="http://+:$PORT"
    echo "Starting on port $PORT (from Railway PORT variable)"
else
    export ASPNETCORE_URLS="http://+:8080"
    echo "Starting on port 8080 (default)"
fi

echo "ASPNETCORE_URLS=$ASPNETCORE_URLS"
echo "ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-Production}"

# Log connection info (masked)
if [ -n "$ConnectionStrings__Default" ]; then
    echo "Database connection configured via ConnectionStrings__Default"
fi

# Start the application
exec dotnet BankSystem.Api.dll
