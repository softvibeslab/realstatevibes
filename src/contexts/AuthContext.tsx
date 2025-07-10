import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, userData: { name: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, login, register, logout, updateUserPassword, loading, error } = useSupabase();

  useEffect(() => {
    // Inicializar datos demo y verificar sesión local
    const initializeAuth = async () => {
      try {
        // Inicializar datos demo
        localDataService.initializeDemoData();
        
        // Verificar si hay una sesión guardada
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await localDataService.updateUser(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };
  

  

  

    return (
    <AuthContext.Provider value={{ 
      user, 
      updateUser,
      login,
      register,
      logout,
      updateUserPassword,
      isLoading: loading,
      error
    }}>
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