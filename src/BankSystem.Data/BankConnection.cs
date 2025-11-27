
using System;

namespace BankSystem.Data
{
    public static class BankConnection
    {
        private const string DefaultConnectionString = "Server=.;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;Encrypt=True;";
        private static string? _configuredConnectionString;

        /// <summary>
        /// Allows the API host to set the connection string from configuration (appsettings, secrets, etc.).
        /// </summary>
        public static void Configure(string? connectionString)
        {
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                _configuredConnectionString = EnsureTlsOptions(connectionString);
            }
        }

        public static string ConnectionString
        {
            get
            {
                return _configuredConnectionString
                    ?? GetEnvironmentConnectionString()
                    ?? BuildFromUrlVariable()
                    ?? BuildFromParts()
                    ?? DefaultConnectionString;
            }
        }

        private static string? GetEnvironmentConnectionString()
        {
            var connStr = GetEnv("ConnectionStrings__Default")
                ?? GetEnv("BANKSYSTEM_DB_CONNECTION")
                ?? GetEnv("SQLSERVER_CONNECTION_STRING")
                ?? GetEnv("SQLAZURECONNSTR_DefaultConnection")
                ?? GetEnv("CUSTOMCONNSTR_DefaultConnection");
            
            return connStr != null ? EnsureTlsOptions(connStr) : null;
        }

        private static string? BuildFromUrlVariable()
        {
            var rawUrl = GetEnv("MSSQL_URL")
                ?? GetEnv("SQLSERVER_URL")
                ?? GetEnv("RAILWAY_DATABASE_URL")
                ?? GetEnv("DATABASE_URL")
                ?? GetEnv("DB_URL");

            if (string.IsNullOrWhiteSpace(rawUrl))
            {
                return null;
            }

            // If the variable already contains a connection string, just return it.
            if (rawUrl.Contains("Server=", StringComparison.OrdinalIgnoreCase))
            {
                return EnsureTlsOptions(rawUrl);
            }

            if (!Uri.TryCreate(rawUrl, UriKind.Absolute, out var uri))
            {
                return null;
            }

            var userInfoParts = (uri.UserInfo ?? string.Empty).Split(':', 2, StringSplitOptions.TrimEntries);
            var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : null;
            var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : null;
            var database = uri.AbsolutePath.Trim('/');
            var host = uri.Host;
            var port = uri.IsDefaultPort ? null : uri.Port.ToString();

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(database) || string.IsNullOrWhiteSpace(username) || password is null)
            {
                return null;
            }

            var server = string.IsNullOrWhiteSpace(port) ? host : $"{host},{port}";
            return $"Server={server};Database={database};User Id={username};Password={password};Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=30;";
        }

        private static string? BuildFromParts()
        {
            var host = GetEnv("DB_HOST")
                ?? GetEnv("DATABASE_HOST")
                ?? GetEnv("MSSQL_HOST")
                ?? GetEnv("SQLSERVER_HOST")
                ?? GetEnv("RAILWAY_TCP_PROXY_DOMAIN");

            var port = GetEnv("DB_PORT")
                ?? GetEnv("DATABASE_PORT")
                ?? GetEnv("MSSQL_PORT")
                ?? GetEnv("SQLSERVER_PORT")
                ?? GetEnv("RAILWAY_TCP_PROXY_PORT");

            var database = GetEnv("DB_NAME")
                ?? GetEnv("DATABASE_NAME")
                ?? GetEnv("MSSQL_DB")
                ?? GetEnv("SQLSERVER_DB")
                ?? GetEnv("RAILWAY_DATABASE");

            var username = GetEnv("DB_USER")
                ?? GetEnv("DATABASE_USERNAME")
                ?? GetEnv("MSSQL_USER")
                ?? GetEnv("SQLSERVER_USER")
                ?? GetEnv("RAILWAY_USERNAME");

            var password = GetEnv("DB_PASSWORD")
                ?? GetEnv("DATABASE_PASSWORD")
                ?? GetEnv("MSSQL_PASSWORD")
                ?? GetEnv("SQLSERVER_PASSWORD")
                ?? GetEnv("RAILWAY_PASSWORD");

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(database) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return null;
            }

            var server = string.IsNullOrWhiteSpace(port) ? host : $"{host},{port}";
            return $"Server={server};Database={database};User Id={username};Password={password};Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=30;";
        }

        /// <summary>
        /// Ensures TLS/SSL options are present in connection string for Railway compatibility
        /// </summary>
        private static string EnsureTlsOptions(string connStr)
        {
            if (!connStr.Contains("TrustServerCertificate", StringComparison.OrdinalIgnoreCase))
            {
                connStr = connStr.TrimEnd(';') + ";TrustServerCertificate=True";
            }
            if (!connStr.Contains("Encrypt=", StringComparison.OrdinalIgnoreCase))
            {
                connStr = connStr.TrimEnd(';') + ";Encrypt=True";
            }
            if (!connStr.Contains("Connection Timeout", StringComparison.OrdinalIgnoreCase) && 
                !connStr.Contains("ConnectTimeout", StringComparison.OrdinalIgnoreCase))
            {
                connStr = connStr.TrimEnd(';') + ";Connection Timeout=30";
            }
            return connStr;
        }

        private static string? GetEnv(string key) => Environment.GetEnvironmentVariable(key);
    }
}
