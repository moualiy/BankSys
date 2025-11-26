namespace BankSystem.Data.Models
{
    public class LoginRegister
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public DateTime LoginTimestamp { get; set; }
        public short LoginStatus { get; set; }
    }
}
