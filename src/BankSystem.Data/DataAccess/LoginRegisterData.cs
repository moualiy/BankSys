using BankSystem.Data.Models;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace BankSystem.Data.DataAccess
{
    public class LoginRegisterData
    {
        public static void AddLoginAttempt(int userId, bool success)
        {
            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = "INSERT INTO LoginRegister (UserId, LoginTimestamp, LoginStatus) VALUES (@UserId, @LoginTimestamp, @LoginStatus)";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserId", userId);
                    command.Parameters.AddWithValue("@LoginTimestamp", System.DateTime.Now);
                    command.Parameters.AddWithValue("@LoginStatus", success ? 1 : 0);

                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        public static List<LoginRegister> GetLoginActivities()
        {
            List<LoginRegister> activities = new List<LoginRegister>();

            using (SqlConnection connection = new SqlConnection(BankConnection.ConnectionString))
            {
                string query = @"
                    SELECT lr.Id, lr.UserId, u.UserName, lr.LoginTimestamp, lr.LoginStatus
                    FROM LoginRegister lr
                    JOIN Users u ON lr.UserId = u.Id
                    ORDER BY lr.LoginTimestamp DESC";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    connection.Open();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            LoginRegister activity = new LoginRegister
                            {
                                Id = (int)reader["Id"],
                                UserId = (int)reader["UserId"],
                                UserName = (string)reader["UserName"],
                                LoginTimestamp = (System.DateTime)reader["LoginTimestamp"],
                                LoginStatus = (short)reader["LoginStatus"]
                            };
                            activities.Add(activity);
                        }
                    }
                }
            }

            return activities;
        }
    }
}
