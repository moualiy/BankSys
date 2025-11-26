using BankSystem.Data.DataAccess;
using BankSystem.Data.Models;
using System;

namespace BankSystem.Business.Services
{
    public class UserService
    {
        public User Register(User user)
        {
            // Check if user exists
            if (UserData.IsUserExist(user.UserName))
            {
                throw new Exception("Username already exists.");
            }

            // Password is not hashed

            // Set default permission level
            user.PermissionLevel = 1; // 1 for regular user

            // Save the user
            int newUserId = UserData.AddNewUser(user);
            user.Id = newUserId;

            return user;
        }

        public User? Login(string username, string password)
        {
            Console.WriteLine($"Attempting to log in user: {username}");
            // Find user by username
            var user = UserData.GetUserByUsername(username);

            if (user == null)
            {
                // Cannot log failed attempt for non-existing user because of foreign key constraint
                Console.WriteLine($"User not found: {username}");
                return null; // User not found
            }

            // Verify password
            if (password != user.PasswordHash)
            {
                LoginRegisterData.AddLoginAttempt(user.Id, false);
                Console.WriteLine($"Invalid password for user: {username}");
                return null; // Invalid password
            }
            
            LoginRegisterData.AddLoginAttempt(user.Id, true);
            Console.WriteLine($"User logged in successfully: {username}");
            return user;
        }

        public IEnumerable<User> GetAllUsers()
        {
            return UserData.GetAllUsers();
        }

        public User? FindById(int id)
        {
            return UserData.FindUser(id);
        }

        public User? FindByUsername(string username)
        {
            return UserData.GetUserByUsername(username);
        }

        public void UpdateUser(User user)
        {
            // Ensure the user exists
            var existing = UserData.FindUser(user.Id);
            if (existing == null)
            {
                throw new Exception("User not found.");
            }

            var rows = UserData.UpdateUser(user);
            if (rows == 0)
            {
                throw new Exception("Failed to update user.");
            }
        }

        public void DeleteUser(int id)
        {
            var existing = UserData.FindUser(id);
            if (existing == null)
            {
                throw new Exception("User not found.");
            }

            var rows = UserData.DeleteUser(id);
            if (rows == 0)
            {
                throw new Exception("Failed to delete user.");
            }
        }
    }
}
