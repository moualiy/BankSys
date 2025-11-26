import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const FindUser = () => {
  const [query, setQuery] = useState('');
  const { data: user, loading, error, request: apiRequest } = useApi();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    // Decide whether query is numeric id or username text
    const isNumeric = /^\d+$/.test(query);
    try {
      if (isNumeric) {
        await apiRequest('get', `/users/${query}`);
      } else {
        // search by username
        // encode the username for URL safety
        const encoded = encodeURIComponent(query);
        await apiRequest('get', `/users/username/${encoded}`);
      }
      toast.success('User found.');
    } catch (err) {
      toast.error('User not found.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Find User</h1>
        <Link to="/users" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Manage Users
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex items-center">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter User ID or username (e.g. User1)" className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">Search</button>
          </div>
        </form>
      </div>
      {loading && <div className="p-4">Loading...</div>}
      {error && <div className="p-4 text-red-500">User not found</div>}
      {user && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.userName}</p>
          <p><strong>Permission Level:</strong> {user.permissionLevel}</p>
        </div>
      )}
    </div>
  );
};

export default FindUser;