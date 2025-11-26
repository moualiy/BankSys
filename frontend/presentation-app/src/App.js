import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/Clients/ClientList';
import AddClient from './pages/Clients/AddClient';
import UpdateClient from './pages/Clients/UpdateClient';
import DeleteClient from './pages/Clients/DeleteClient';
import FindClient from './pages/Clients/FindClient';

import Deposit from './pages/Transactions/Deposit';
import Withdraw from './pages/Transactions/Withdraw';
import Transfer from './pages/Transactions/Transfer';
import History from './pages/Transactions/History';
import TotalBalances from './pages/Transactions/TotalBalances';
import Transactions from './pages/Transactions/Transactions';

import UserList from './pages/Users/UserList';
import AddUser from './pages/Users/AddUser';
import UpdateUser from './pages/Users/UpdateUser';
import DeleteUser from './pages/Users/DeleteUser';
import FindUser from './pages/Users/FindUser';
import UsersPage from './pages/Users/Users';

import CurrencyList from './pages/CurrencyExchange/CurrencyList';
import FindCurrency from './pages/CurrencyExchange/FindCurrency';
import Converter from './pages/CurrencyExchange/Converter';
import LiveRates from './pages/CurrencyExchange/LiveRates';
import CurrencyExchange from './pages/CurrencyExchange/CurrencyExchange';

import LoginRegister from './pages/LoginRegister';
import Logout from './pages/Logout';
import Layout from './components/Layout';

import './index.css'; // Import Tailwind CSS

const AppContent = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients/list" element={<ClientList />} />
        <Route path="/clients/add" element={<AddClient />} />
        <Route path="/clients/update/:id" element={<UpdateClient />} />
        <Route path="/clients/delete/:id" element={<DeleteClient />} />
        <Route path="/clients/find" element={<FindClient />} />

        <Route path="/transactions/deposit" element={<Deposit />} />
        <Route path="/transactions/withdraw" element={<Withdraw />} />
        <Route path="/transactions/transfer" element={<Transfer />} />
        <Route path="/transactions/history" element={<History />} />
        <Route path="/transactions/total-balances" element={<TotalBalances />} />
        <Route path="/transactions" element={<Transactions />} />

        <Route path="/users/list" element={<UserList />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/update/:id" element={<UpdateUser />} />
        <Route path="/users/delete/:id" element={<DeleteUser />} />
        <Route path="/users/find" element={<FindUser />} />
        <Route path="/users" element={<UsersPage />} />

        <Route path="/currency-exchange/list" element={<CurrencyList />} />
        <Route path="/currency-exchange/find" element={<FindCurrency />} />
        <Route path="/currency-exchange/converter" element={<Converter />} />
        <Route path="/currency-exchange/live-rates" element={<LiveRates />} />
        <Route path="/currency-exchange" element={<CurrencyExchange />} />

        <Route path="/login-register" element={<LoginRegister />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className={`${theme} min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme={theme === 'dark' ? 'dark' : 'light'} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;