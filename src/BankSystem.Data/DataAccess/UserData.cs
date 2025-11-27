
using BankSystem.Data.Models;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;

namespace BankSystem.Data.DataAccess
{
    public class UserData
    {
        public static List<User> GetAllUsers()
        {
            List<User> users = new List<User>();

            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT * FROM Users";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    connection.Open();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            User user = new User
                            {
                                Id = (int)reader["Id"],
                                FirstName = (string)reader["FirstName"],
                                LastName = (string)reader["LastName"],
                                Email = (string)reader["Email"],
                                UserName = (string)reader["UserName"],
                                PasswordHash = (string)reader["PasswordHash"],
                                PermissionLevel = (short)reader["PermissionLevel"]
                            };
                            users.Add(user);
                        }
                    }
                }
            }

            return users;
        }

        public static int AddNewUser(User user)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "INSERT INTO Users (FirstName, LastName, Email, UserName, PasswordHash, PermissionLevel) VALUES (@FirstName, @LastName, @Email, @UserName, @PasswordHash, @PermissionLevel); SELECT SCOPE_IDENTITY();";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@FirstName", user.FirstName);
                    command.Parameters.AddWithValue("@LastName", user.LastName);
                    command.Parameters.AddWithValue("@Email", user.Email);
                    command.Parameters.AddWithValue("@UserName", user.UserName);
                    command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
                    command.Parameters.AddWithValue("@PermissionLevel", user.PermissionLevel);

                    connection.Open();
                    return System.Convert.ToInt32(command.ExecuteScalar());
                }
            }
        }

        public static int DeleteUser(int userId)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "DELETE FROM Users WHERE Id = @UserId";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserId", userId);

                    connection.Open();
                    return command.ExecuteNonQuery();
                }
            }
        }

        public static int UpdateUser(User user)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "UPDATE Users SET FirstName = @FirstName, LastName = @LastName, Email = @Email, UserName = @UserName, PasswordHash = @PasswordHash, PermissionLevel = @PermissionLevel WHERE Id = @Id";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", user.Id);
                    command.Parameters.AddWithValue("@FirstName", user.FirstName);
                    command.Parameters.AddWithValue("@LastName", user.LastName);
                    command.Parameters.AddWithValue("@Email", user.Email);
                    command.Parameters.AddWithValue("@UserName", user.UserName);
                    command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
                    command.Parameters.AddWithValue("@PermissionLevel", user.PermissionLevel);

                    connection.Open();
                    return command.ExecuteNonQuery();
                }
            }
        }

        public static User? FindUser(int userId)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT * FROM Users WHERE Id = @UserId";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserId", userId);

                    connection.Open();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new User
                            {
                                Id = (int)reader["Id"],
                                FirstName = (string)reader["FirstName"],
                                LastName = (string)reader["LastName"],
                                Email = (string)reader["Email"],
                                UserName = (string)reader["UserName"],
                                PasswordHash = (string)reader["PasswordHash"],
                                PermissionLevel = (short)reader["PermissionLevel"]
                            };
                        }
                    }
                }
            }

            return null;
        }

        public static bool IsUserExist(string username)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "SELECT 1 FROM Users WHERE UserName = @UserName";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserName", username);

                    connection.Open();
                    return command.ExecuteScalar() != null;
                }
            }
        }

        public static User? GetUserByUsername(string username)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
                {
                    string query = "SELECT * FROM Users WHERE UserName = @UserName";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserName", username);

                        connection.Open();
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new User
                                {
                                    Id = (int)reader["Id"],
                                    FirstName = (string)reader["FirstName"],
                                    LastName = (string)reader["LastName"],
                                    Email = (string)reader["Email"],
                                    UserName = (string)reader["UserName"],
                                    PasswordHash = (string)reader["PasswordHash"],
                                    PermissionLevel = (short)reader["PermissionLevel"]
                                };
                            }
                        }
                    }
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine(ex.ToString());
            }

            return null;
        }
    }
}
