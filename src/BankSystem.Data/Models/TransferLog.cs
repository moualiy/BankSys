
using System;

namespace BankSystem.Data.Models
{
    public class TransferLog
    {
        public int Id { get; set; }
        public int SenderClientId { get; set; }
        public int ReceiverClientId { get; set; }
        public int AuthorizedByUserId { get; set; }
        public decimal Amount { get; set; }
        public decimal SenderBalanceAfter { get; set; }
        public decimal ReceiverBalanceAfter { get; set; }
        public DateTime TransferTimestamp { get; set; }
    }
}
