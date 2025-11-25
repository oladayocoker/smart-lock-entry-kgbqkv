
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
      console.log('🔍 Loading stored auth...');
      const storedUser = await AsyncStorage.getItem('user');
      const storedGuest = await AsyncStorage.getItem('isGuest');
      
      if (storedUser) {
        console.log('✅ Found stored user:', storedUser);
        setUser(JSON.parse(storedUser));
      } else if (storedGuest === 'true') {
        console.log('✅ Found guest mode');
        setIsGuest(true);
      } else {
        console.log('ℹ️ No stored auth found');
      }
    } catch (error) {
      console.log('❌ Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 Logging in user:', username);
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
      console.log('✅ Login successful');
    } catch (error) {
      console.log('❌ Login error:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('📝 Registering user:', username);
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
      console.log('✅ Registration successful');
    } catch (error) {
      console.log('❌ Register error:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 === LOGOUT STARTED ===');
      console.log('📊 Current user before logout:', user);
      console.log('📊 Current isGuest before logout:', isGuest);
      
      // Clear state FIRST - this is important for immediate UI update
      setUser(null);
      setIsGuest(false);
      console.log('✅ State cleared - user set to null, isGuest set to false');
      
      // Then clear AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isGuest');
      console.log('✅ AsyncStorage cleared successfully');
      
      console.log('🚪 === LOGOUT COMPLETED ===');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    try {
      console.log('👤 Continuing as guest...');
      setIsGuest(true);
      setUser(null);
      await AsyncStorage.setItem('isGuest', 'true');
      await AsyncStorage.removeItem('user');
      console.log('✅ Guest mode activated');
    } catch (error) {
      console.log('❌ Guest mode error:', error);
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
