import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';
import { Edit, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/ui';

const UserList = () => {
  const { data: users, loading, error, request: fetchUsers } = useApi();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers('get', '/users');
  }, [fetchUsers]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDelete = async (id) => {
    setSelectedUserId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    
    setIsDeleting(true);
    try {
      await fetchUsers('delete', `/users/${selectedUserId}`);
      toast.success('User deleted successfully.');
      fetchUsers('get', '/users');
      setDeleteConfirmOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      toast.error('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) {
    toast.error('Failed to fetch users.');
    return <div className="p-4 text-red-500">Error: Failed to fetch users.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">User List</h1>
        <Link to="/users/add" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add New User
        </Link>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {users && users.map((user) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Username</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.userName}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                <Link to={`/users/update/${user.id}`} className="flex-1 text-center inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 px-3 py-2 rounded-md transition-colors">
                  <Edit size={18} className="mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
                <button onClick={() => handleDelete(user.id)} className="flex-1 text-center inline-flex items-center justify-center bg-red-50 dark:bg-red-900/30 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 rounded-md transition-colors">
                  <Trash2 size={18} className="mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users && users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/users/update/${user.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-4">
                      <Edit />
                    </Link>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600">
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSelectedUserId(null);
        }}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        isDangerous={true}
      />
    </div>
  );
};

export default UserList;