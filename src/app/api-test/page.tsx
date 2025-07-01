'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Test Users API
  const testUsersAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users);
      setMessage('Users fetched successfully!');
    } catch (error) {
      setMessage('Error fetching users');
    }
    setLoading(false);
  };

  // Test Posts API
  const testPostsAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data.posts);
      setMessage('Posts fetched successfully!');
    } catch (error) {
      setMessage('Error fetching posts');
    }
    setLoading(false);
  };

  // Test Database Connection
  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage(`✅ Database connected! Tables: ${data.tables.join(', ')}`);
        console.log('Database Info:', data);
      } else {
        setMessage(`❌ Database error: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Database connection failed');
    }
    setLoading(false);
  };

  // Create Test User
  const createTestUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'password123',
        }),
      });
      const data = await response.json();
      setMessage('User created successfully!');
      testUsersAPI(); // Refresh users list
    } catch (error) {
      setMessage('Error creating user');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          API Testing Page
        </h1>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {message}
          </div>
        )}

        {/* API Test Buttons */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            {loading ? 'Loading...' : 'Test Database'}
          </button>

          <button
            onClick={testUsersAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            {loading ? 'Loading...' : 'Test Users API'}
          </button>

          <button
            onClick={testPostsAPI}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            {loading ? 'Loading...' : 'Test Posts API'}
          </button>

          <button
            onClick={createTestUser}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            {loading ? 'Loading...' : 'Create Test User'}
          </button>
        </div>

        {/* Users Display */}
        {users.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Users ({users.length})
            </h2>
            <div className="grid gap-4">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Role: {user.role} | Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Display */}
        {posts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Posts ({posts.length})
            </h2>
            <div className="grid gap-4">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{post.content}</p>
                  <p className="text-sm text-gray-500">
                    By: {post.author.name} | Published: {post.published ? 'Yes' : 'No'} | 
                    Comments: {post._count.comments}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 