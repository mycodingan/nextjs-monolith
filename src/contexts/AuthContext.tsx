'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        console.log('✅ Restored user session:', parsedUser.email);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        console.error('❌ Login failed:', data.error);
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ Login successful, token received:', data.token ? 'Yes' : 'No');
      console.log('👤 User data:', data.user);

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('💾 Session saved to localStorage');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('📝 Attempting registration for:', email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('📡 Registration response status:', response.status);

      if (!response.ok) {
        console.error('❌ Registration failed:', data.error);
        throw new Error(data.error || 'Registration failed');
      }

      console.log('✅ Registration successful, token received:', data.token ? 'Yes' : 'No');
      console.log('👤 User data:', data.user);

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('💾 Session saved to localStorage');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user?.email);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Session cleared from localStorage');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 