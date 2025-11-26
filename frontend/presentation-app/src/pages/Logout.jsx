import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully.');
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Logging out...</h1>
    </div>
  );
};

export default Logout;
