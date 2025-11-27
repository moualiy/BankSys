
using BankSystem.Data.Models;
using Microsoft.Data.SqlClient;

namespace BankSystem.Data.DataAccess
{
    public class TransactionData
    {
        public static int Deposit(int clientId, decimal amount)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                connection.Open();
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        string updateQuery = "UPDATE Clients SET Balance = Balance + @Amount WHERE Id = @ClientId";
                        using (SqlCommand command = new SqlCommand(updateQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@Amount", amount);
                            command.Parameters.AddWithValue("@ClientId", clientId);
                            int rowsAffected = command.ExecuteNonQuery();

                            if (rowsAffected > 0)
                            {
                                transaction.Commit();
                                return rowsAffected;
                            }
                            else
                            {
                                transaction.Rollback();
                                return 0;
                            }
                        }
                    }
                    catch
                    {
                        try
                        {
                            transaction.Rollback();
                        }
                        catch
                        {
                            // Ignore errors from Rollback if the transaction is already completed
                        }
                        throw;
                    }
                }
            }
        }

        public static int Withdraw(int clientId, decimal amount)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                connection.Open();
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        string selectQuery = "SELECT Balance FROM Clients WHERE Id = @ClientId";
                        decimal balance;
                        using (SqlCommand selectCommand = new SqlCommand(selectQuery, connection, transaction))
                        {
                            selectCommand.Parameters.AddWithValue("@ClientId", clientId);
                            balance = (decimal)selectCommand.ExecuteScalar();
                        }

                        if (balance >= amount)
                        {
                            string updateQuery = "UPDATE Clients SET Balance = Balance - @Amount WHERE Id = @ClientId";
                            using (SqlCommand updateCommand = new SqlCommand(updateQuery, connection, transaction))
                            {
                                updateCommand.Parameters.AddWithValue("@Amount", amount);
                                updateCommand.Parameters.AddWithValue("@ClientId", clientId);
                                int rowsAffected = updateCommand.ExecuteNonQuery();

                                if (rowsAffected > 0)
                                {
                                    transaction.Commit();
                                    return rowsAffected;
                                }
                                else
                                {
                                    transaction.Rollback();
                                    return 0;
                                }
                            }
                        }
                        else
                        {
                            transaction.Rollback();
                            return 0; // Insufficient balance
                        }
                    }
                    catch
                    {
                        try
                        {
                            transaction.Rollback();
                        }
                        catch
                        {
                            // Ignore errors from Rollback if the transaction is already completed
                        }
                        throw;
                    }
                }
            }
        }

        public static decimal GetTotalBalances()
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT SUM(Balance) FROM Clients";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    connection.Open();
                    object result = command.ExecuteScalar();
                    return result == System.DBNull.Value ? 0 : (decimal)result;
                }
            }
        }

        public static bool Transfer(int fromClientId, int toClientId, decimal amount, int authorizedByUserId)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                connection.Open();
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Ensure sender exists and get sender balance
                        string selectSenderQuery = "SELECT Balance FROM Clients WHERE Id = @FromClientId";
                        decimal senderBalance;
                        using (SqlCommand selectSenderCommand = new SqlCommand(selectSenderQuery, connection, transaction))
                        {
                            selectSenderCommand.Parameters.AddWithValue("@FromClientId", fromClientId);
                            object senderBalanceObj = selectSenderCommand.ExecuteScalar();
                            if (senderBalanceObj == null || senderBalanceObj == System.DBNull.Value)
                            {
                                transaction.Rollback();
                                throw new System.ArgumentException($"Sender client with Id {fromClientId} not found.");
                            }
                            senderBalance = (decimal)senderBalanceObj;
                        }

                        if (senderBalance < amount)
                        {
                            transaction.Rollback();
                            return false; // Insufficient balance
                        }

                        // Withdraw from sender
                        string withdrawQuery = "UPDATE Clients SET Balance = Balance - @Amount WHERE Id = @FromClientId";
                        using (SqlCommand withdrawCommand = new SqlCommand(withdrawQuery, connection, transaction))
                        {
                            withdrawCommand.Parameters.AddWithValue("@Amount", amount);
                            withdrawCommand.Parameters.AddWithValue("@FromClientId", fromClientId);
                            withdrawCommand.ExecuteNonQuery();
                        }

                        // Ensure receiver exists before depositing
                        string checkReceiverQuery = "SELECT Balance FROM Clients WHERE Id = @ToClientId";
                        using (SqlCommand checkRecvCmd = new SqlCommand(checkReceiverQuery, connection, transaction))
                        {
                            checkRecvCmd.Parameters.AddWithValue("@ToClientId", toClientId);
                            object recvBalanceObj = checkRecvCmd.ExecuteScalar();
                            if (recvBalanceObj == null || recvBalanceObj == System.DBNull.Value)
                            {
                                transaction.Rollback();
                                throw new System.ArgumentException($"Receiver client with Id {toClientId} not found.");
                            }
                        }

                        // Deposit to receiver
                        string depositQuery = "UPDATE Clients SET Balance = Balance + @Amount WHERE Id = @ToClientId";
                        using (SqlCommand depositCommand = new SqlCommand(depositQuery, connection, transaction))
                        {
                            depositCommand.Parameters.AddWithValue("@Amount", amount);
                            depositCommand.Parameters.AddWithValue("@ToClientId", toClientId);
                            depositCommand.ExecuteNonQuery();
                        }

                        // Ensure authorized user exists to avoid FK violations
                        string checkUserQuery = "SELECT COUNT(1) FROM Users WHERE Id = @AuthorizedByUserId";
                        using (SqlCommand checkUserCmd = new SqlCommand(checkUserQuery, connection, transaction))
                        {
                            checkUserCmd.Parameters.AddWithValue("@AuthorizedByUserId", authorizedByUserId);
                            int userCount = (int)checkUserCmd.ExecuteScalar();
                            if (userCount == 0)
                            {
                                transaction.Rollback();
                                throw new System.ArgumentException($"Authorized user with Id {authorizedByUserId} not found.");
                            }
                        }

                        // Log the transfer
                        string logQuery = "INSERT INTO TransferLog (SenderClientId, ReceiverClientId, AuthorizedByUserId, Amount, SenderBalanceAfter, ReceiverBalanceAfter) VALUES (@SenderClientId, @ReceiverClientId, @AuthorizedByUserId, @Amount, @SenderBalanceAfter, @ReceiverBalanceAfter)";
                        using (SqlCommand logCommand = new SqlCommand(logQuery, connection, transaction))
                        {
                            logCommand.Parameters.AddWithValue("@SenderClientId", fromClientId);
                            logCommand.Parameters.AddWithValue("@ReceiverClientId", toClientId);
                            logCommand.Parameters.AddWithValue("@AuthorizedByUserId", authorizedByUserId);
                            logCommand.Parameters.AddWithValue("@Amount", amount);
                            logCommand.Parameters.AddWithValue("@SenderBalanceAfter", senderBalance - amount);
                            // Retrieve receiver's current balance using a parameterized command so @ToClientId is declared
                            decimal receiverBalanceAfter;
                            using (SqlCommand recvBalanceCmd = new SqlCommand("SELECT Balance FROM Clients WHERE Id = @ToClientId", connection, transaction))
                            {
                                recvBalanceCmd.Parameters.AddWithValue("@ToClientId", toClientId);
                                object recvBalanceObj = recvBalanceCmd.ExecuteScalar();
                                decimal recvBalanceBefore = recvBalanceObj == System.DBNull.Value ? 0 : (decimal)recvBalanceObj;
                                receiverBalanceAfter = recvBalanceBefore + amount;
                            }
                            logCommand.Parameters.AddWithValue("@ReceiverBalanceAfter", receiverBalanceAfter);
                            logCommand.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        return true;
                    }
                    catch
                    {
                        try
                        {
                            transaction.Rollback();
                        }
                        catch
                        {
                            // Ignore errors from Rollback if the transaction is already completed
                        }
                        throw;
                    }
                }
            }
        }

        public static List<TransferLog> GetTransferLog()
        {
            List<TransferLog> transferLogs = new List<TransferLog>();

            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT * FROM TransferLog";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    connection.Open();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            TransferLog transferLog = new TransferLog
                            {
                                Id = (int)reader["Id"],
                                SenderClientId = (int)reader["SenderClientId"],
                                ReceiverClientId = (int)reader["ReceiverClientId"],
                                AuthorizedByUserId = (int)reader["AuthorizedByUserId"],
                                Amount = (decimal)reader["Amount"],
                                SenderBalanceAfter = (decimal)reader["SenderBalanceAfter"],
                                ReceiverBalanceAfter = (decimal)reader["ReceiverBalanceAfter"],
                                TransferTimestamp = (System.DateTime)reader["TransferTimestamp"]
                            };
                            transferLogs.Add(transferLog);
                        }
                    }
                }
            }

            return transferLogs;
        }
    }
}
