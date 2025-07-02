'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/manage', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      const response = await fetch('/api/users/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!formData.currentPassword) {
      setError('Please enter your current password to confirm account deletion');
      return;
    }

    try {
      const response = await fetch('/api/users/manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: formData.currentPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.role}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">#{profile.id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter new password (optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        Update Profile
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Delete Account Section */}
              <div className="border-t mt-8 pt-8">
                <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <div className="flex items-center space-x-4">
                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 