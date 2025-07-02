'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="text-white text-xl font-bold">
                NearnNext
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'ADMIN' && (
                  <Link 
                    href="/admin/users" 
                    className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Manage Users
                  </Link>
                )}
                <div className="relative group">
                  <button className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                    <span className="mr-2">👤 {user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 p-2 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white rounded-lg mt-2 shadow-lg">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link 
                      href="/admin/users" 
                      className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Manage Users
                    </Link>
                  )}
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-700 hover:bg-gray-100 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 