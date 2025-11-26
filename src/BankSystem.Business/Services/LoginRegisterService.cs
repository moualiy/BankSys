using BankSystem.Data.DataAccess;
using BankSystem.Data.Models;
using System.Collections.Generic;

namespace BankSystem.Business.Services
{
    public class LoginRegisterService
    {
        public List<LoginRegister> GetLoginActivities()
        {
            return LoginRegisterData.GetLoginActivities();
        }
    }
}
