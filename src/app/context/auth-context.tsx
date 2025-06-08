"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../types/auth'; // Corrected import User type

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user token exists and is valid
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      // Specify User as the expected response type for axios.get
      const response = await axios.get<User>(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Specify the expected response type for axios.post
      const response = await axios.post<{ accessToken: string; user: User }>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const { accessToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user); // user is now correctly typed
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
