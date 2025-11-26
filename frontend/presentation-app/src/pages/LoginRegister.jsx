import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const LoginRegister = () => {
  const { data: loginActivities, loading, error, request: fetchLoginActivities } = useApi();

  useEffect(() => {
    fetchLoginActivities('get', '/login-register');
  }, [fetchLoginActivities]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) {
    toast.error('Failed to fetch login activities.');
    return <div className="p-4 text-red-500">Error: Failed to fetch login activities.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Login Register</h1>
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Login Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Login Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loginActivities && loginActivities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap">{activity.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(activity.loginTimestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{activity.loginStatus === 1 ? 'Success' : 'Failed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginRegister;