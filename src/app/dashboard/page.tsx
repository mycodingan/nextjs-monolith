'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '../components/Navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-gray-600">
                  Manage your account and explore the platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Profile</h3>
                      <p className="text-blue-100">Manage your account</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/profile')}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
                  >
                    View Profile
                  </button>
                </div>

                {/* Posts Card */}
                <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Posts</h3>
                      <p className="text-green-100">Create and manage posts</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/posts')}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
                  >
                    View Posts
                  </button>
                </div>

                {/* Admin Panel */}
                {user.role === 'ADMIN' && (
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-6 text-white">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">Admin Panel</h3>
                        <p className="text-red-100">Manage all users</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/admin/users')}
                      className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
                    >
                      Manage Users
                    </button>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">#{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 