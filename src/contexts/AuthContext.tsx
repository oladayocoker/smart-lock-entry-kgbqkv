
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedGuest = await AsyncStorage.getItem('isGuest');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedGuest === 'true') {
        setIsGuest(true);
      }
    } catch (error) {
      console.log('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // In a real app, this would call your backend API
      // For now, we'll simulate a successful login
      const mockUser: User = {
        id: '1',
        username,
        email: `${username}@example.com`,
      };
      
      setUser(mockUser);
      setIsGuest(false);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.removeItem('isGuest');
    } catch (error) {
      console.log('Login error:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // In a real app, this would call your backend API
      const mockUser: User = {
        id: '1',
        username,
        email,
      };
      
      setUser(mockUser);
      setIsGuest(false);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.removeItem('isGuest');
    } catch (error) {
      console.log('Register error:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsGuest(false);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isGuest');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const continueAsGuest = async () => {
    try {
      setIsGuest(true);
      setUser(null);
      await AsyncStorage.setItem('isGuest', 'true');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.log('Guest mode error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        login,
        register,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
