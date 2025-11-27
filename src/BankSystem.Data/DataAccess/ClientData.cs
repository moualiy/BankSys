
using BankSystem.Data.Models;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;

namespace BankSystem.Data.DataAccess
{
    public class ClientData
    {
        public static List<Client> GetAllClients()
        {
            List<Client> clients = new List<Client>();
            try
            {
                using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
                {
                    string query = "SELECT * FROM Clients";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Client client = new Client
                                {
                                    Id = (int)reader["Id"],
                                    FirstName = (string)reader["FirstName"],
                                    LastName = (string)reader["LastName"],
                                    Email = (string)reader["Email"],
                                    Phone = reader["Phone"] as string,
                                    UserName = (string)reader["UserName"],
                                    PinCode = (string)reader["PinCode"],
                                    Balance = (decimal)reader["Balance"],
                                    CreatedAt = reader["CreatedAt"] == DBNull.Value ? default : (System.DateTime)reader["CreatedAt"]
                                };
                                clients.Add(client);
                            }
                        }
                    }
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"An error occurred while fetching clients: {ex.ToString()}");
                // Optionally, re-throw the exception if you want the caller to handle it
                // throw;
            }
            return clients;
        }

        public static int AddNewClient(Client client)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "INSERT INTO Clients (FirstName, LastName, Email, Phone, UserName, PinCode, Balance) VALUES (@FirstName, @LastName, @Email, @Phone, @UserName, @PinCode, @Balance); SELECT SCOPE_IDENTITY();";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@FirstName", client.FirstName);
                    command.Parameters.AddWithValue("@LastName", client.LastName);
                    command.Parameters.AddWithValue("@Email", client.Email);
                    command.Parameters.AddWithValue("@Phone", client.Phone ?? (object)System.DBNull.Value);
                    command.Parameters.AddWithValue("@UserName", client.UserName);
                    command.Parameters.AddWithValue("@PinCode", client.PinCode);
                    command.Parameters.AddWithValue("@Balance", client.Balance);

                    connection.Open();
                    return System.Convert.ToInt32(command.ExecuteScalar());
                }
            }
        }

        public static int DeleteClient(int clientId)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "DELETE FROM Clients WHERE Id = @ClientId";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@ClientId", clientId);

                    connection.Open();
                    return command.ExecuteNonQuery();
                }
            }
        }

        public static int UpdateClient(Client client)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "UPDATE Clients SET FirstName = @FirstName, LastName = @LastName, Email = @Email, Phone = @Phone, UserName = @UserName, PinCode = @PinCode, Balance = @Balance WHERE Id = @Id";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", client.Id);
                    command.Parameters.AddWithValue("@FirstName", client.FirstName);
                    command.Parameters.AddWithValue("@LastName", client.LastName);
                    command.Parameters.AddWithValue("@Email", client.Email);
                    command.Parameters.AddWithValue("@Phone", client.Phone ?? (object)System.DBNull.Value);
                    command.Parameters.AddWithValue("@UserName", client.UserName);
                    command.Parameters.AddWithValue("@PinCode", client.PinCode);
                    command.Parameters.AddWithValue("@Balance", client.Balance);

                    connection.Open();
                    return command.ExecuteNonQuery();
                }
            }
        }

        public static Client? FindClient(int clientId)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT * FROM Clients WHERE Id = @ClientId";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@ClientId", clientId);

                    connection.Open();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new Client
                            {
                                Id = (int)reader["Id"],
                                FirstName = (string)reader["FirstName"],
                                LastName = (string)reader["LastName"],
                                Email = (string)reader["Email"],
                                Phone = reader["Phone"] as string,
                                UserName = (string)reader["UserName"],
                                PinCode = (string)reader["PinCode"],
                                Balance = (decimal)reader["Balance"],
                                                                    CreatedAt = reader["CreatedAt"] == DBNull.Value ? default : (System.DateTime)reader["CreatedAt"]
                                
                            };
                        }
                    }
                }
            }

            return null;
        }

        public static bool IsClientExist(int clientId)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT 1 FROM Clients WHERE Id = @ClientId";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@ClientId", clientId);

                    connection.Open();
                    return command.ExecuteScalar() != null;
                }
            }
        }
    }
}
