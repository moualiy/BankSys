using BankSystem.Data.DataAccess;
using BankSystem.Data.Models;

namespace BankSystem.Business.Services
{
    public class ClientService
    {
        public List<Client> GetAllClients()
        {
            return ClientData.GetAllClients();
        }

        public int AddNewClient(Client client)
        {
            return ClientData.AddNewClient(client);
        }

        public int DeleteClient(int clientId)
        {
            return ClientData.DeleteClient(clientId);
        }

        public int UpdateClient(Client client)
        {
            return ClientData.UpdateClient(client);
        }

        public Client? FindClient(int clientId)
        {
            return ClientData.FindClient(clientId);
        }

        public bool IsClientExist(int clientId)
        {
            return ClientData.IsClientExist(clientId);
        }
    }
}
