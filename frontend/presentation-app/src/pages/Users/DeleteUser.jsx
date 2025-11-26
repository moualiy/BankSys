import React from 'react';
import { Link, useParams } from 'react-router-dom';

const DeleteUser = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Link to="/users" className="text-blue-600 dark:text-blue-400 hover:underline">
        &larr; Back to Manage Users
      </Link>
      <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">Delete User {id}</h1>
    </div>
  );
};

export default DeleteUser;