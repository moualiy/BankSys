import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const FindClient = () => {
  const [clientId, setClientId] = useState('');
  const { data: client, loading, error, request: findClient } = useApi();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await findClient('get', `/clients/${clientId}`);
      toast.success('Client found.');
    } catch (error) {
      toast.error('Client not found.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Find Client</h1>
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex items-center">
            <input type="number" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Enter Client ID" className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
      {loading && <div className="p-4">Loading...</div>}
      {error && <div className="p-4 text-red-500">Client not found</div>}
      {client && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
          <h2 className="text-2xl font-bold mb-4">Client Details</h2>
          <p><strong>Name:</strong> {client.firstName} {client.lastName}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Phone:</strong> {client.phone}</p>
          <p><strong>Balance:</strong> {client.balance}</p>
        </div>
      )}
    </div>
  );
};

export default FindClient;