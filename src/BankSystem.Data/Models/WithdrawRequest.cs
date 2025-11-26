namespace BankSystem.Data.Models
{
    public class WithdrawRequest
    {
        public int ClientId { get; set; }
        public decimal Amount { get; set; }
    }
}
