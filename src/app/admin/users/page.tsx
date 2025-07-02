'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Langsung cek localStorage untuk token dan user
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');
      
      if (localToken && localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser.role === 'ADMIN') {
            console.log('✅ Admin user found in localStorage, fetching users...');
            fetchUsers();
          } else {
            setError('User is not an admin');
          }
        } catch (error) {
          console.error('❌ Error parsing user from localStorage:', error);
          setError('Invalid user data in localStorage');
        }
      } else {
        setError('No authentication data found in localStorage');
      }
    }
  }, []); // Hanya jalankan sekali saat component mount

  const fetchUsers = async () => {
    try {
      // Langsung ambil token dari localStorage
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!localToken) {
        setError('No authentication token found in localStorage');
        return;
      }
      
      console.log('🔍 Fetching users with localStorage token:', localToken);
      console.log('Token length:', localToken.length);
      
      const response = await fetch('/api/users/admin-manage', {
        headers: {
          'Authorization': `Bearer ${localToken}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        console.error('❌ API Error:', data);
        setError(data.error || 'Failed to fetch users');
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setError(''); // Clear any previous errors
      console.log('✅ Users fetched successfully:', data.users.length);
    } catch (err: any) {
      console.error('❌ Fetch users error:', err);
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!localToken) {
        setError('No authentication token found in localStorage');
        return;
      }

      console.log('🔍 Creating user with localStorage token:', localToken);
      const response = await fetch('/api/users/admin-manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Create user error:', data);
        throw new Error(data.error || 'Failed to create user');
      }

      console.log('✅ User created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Create user error:', err);
      setError(err.message);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!localToken) {
        setError('No authentication token found in localStorage');
        return;
      }

      console.log('🔍 Updating user with localStorage token:', localToken);
      const response = await fetch('/api/users/admin-manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localToken}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...formData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Update user error:', data);
        throw new Error(data.error || 'Failed to update user');
      }

      console.log('✅ User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Update user error:', err);
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!localToken) {
        setError('No authentication token found in localStorage');
        return;
      }

      console.log('🔍 Deleting user with localStorage token:', localToken);
      const response = await fetch('/api/users/admin-manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localToken}`
        },
        body: JSON.stringify({ userId: selectedUser.id })
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Delete user error:', data);
        throw new Error(data.error || 'Failed to delete user');
      }

      console.log('✅ User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Delete user error:', err);
      setError(err.message);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Cek apakah user adalah admin dari localStorage
  const isAdmin = (() => {
    if (typeof window !== 'undefined') {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          return parsedUser.role === 'ADMIN';
        } catch (error) {
          return false;
        }
      }
    }
    return false;
  })();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('🔄 Manual refresh triggered');
                      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                      const localUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                      console.log('localStorage token:', localToken);
                      console.log('localStorage user:', localUser);
                      fetchUsers();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add New User
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 