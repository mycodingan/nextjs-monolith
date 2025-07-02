'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from './components/Navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NearnNext
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A modern user management system built with Next.js, featuring authentication, 
            role-based access control, and a beautiful user interface.
          </p>

          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, <span className="font-semibold text-blue-600">{user.name}</span>!
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Go to Dashboard
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                  >
                    Manage Users
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Get started by creating an account or signing in
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Authentication</h3>
            <p className="text-gray-600">
              JWT-based authentication with password hashing and role-based access control.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">
              Complete CRUD operations for user management with admin-only features.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern UI</h3>
            <p className="text-gray-600">
              Beautiful, responsive design built with Tailwind CSS and modern React patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
