import React from 'react';
import { Link, useParams } from 'react-router-dom';

const DeleteClient = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Link to="/clients/list" className="text-blue-600 dark:text-blue-400 hover:underline">
        &larr; Back to Client List
      </Link>
      <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">Delete Client {id}</h1>
    </div>
  );
};

export default DeleteClient;