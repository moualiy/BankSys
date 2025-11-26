
using System;

namespace BankSystem.Data.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string UserName { get; set; }
        public required string PasswordHash { get; set; }
        public short PermissionLevel { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
