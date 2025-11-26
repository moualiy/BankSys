using BankSystem.Data.DataAccess;
using BankSystem.Data.Models;
using System.Collections.Generic;

namespace BankSystem.Business.Services
{
    public class TransactionService
    {
        public int Deposit(int clientId, decimal amount)
        {
            return TransactionData.Deposit(clientId, amount);
        }

        public int Withdraw(int clientId, decimal amount)
        {
            return TransactionData.Withdraw(clientId, amount);
        }

        public decimal GetTotalBalances()
        {
            return TransactionData.GetTotalBalances();
        }

        public bool Transfer(int fromClientId, int toClientId, decimal amount, int authorizedByUserId)
        {
            return TransactionData.Transfer(fromClientId, toClientId, amount, authorizedByUserId);
        }

        public List<TransferLog> GetTransferLog()
        {
            return TransactionData.GetTransferLog();
        }
    }
}