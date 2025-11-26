
using System;

namespace BankSystem.Data
{
    public static class BankConnection
    {
        private const string DefaultConnectionString = "Server=.;Database=Bank;User Id=sa;Password=sa123456;TrustServerCertificate=True;";

        public static string ConnectionString
        {
            get
            {
                return Environment.GetEnvironmentVariable("ConnectionStrings__Default")
                    ?? Environment.GetEnvironmentVariable("BANKSYSTEM_DB_CONNECTION")
                    ?? DefaultConnectionString;
            }
        }
    }
}
