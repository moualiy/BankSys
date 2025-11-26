namespace BankSystem.Data.Models
{
    public class TransferRequest
    {
        public int FromClientId { get; set; }
        public int ToClientId { get; set; }
        public decimal Amount { get; set; }
        public int AuthorizedByUserId { get; set; }
    }
}
