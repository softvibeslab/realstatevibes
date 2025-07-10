import React, { createContext, useContext, useState, useEffect } from 'react';
import { localDataService } from '../services/localDataService';
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar si el usuario existe en los datos locales
      const userExists = await localDataService.getUserByEmail(email);
      
      if (!userExists) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Usuario no encontrado. Usa las credenciales de demo.' 
        };
      }

      if (!userExists.is_active) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Tu cuenta está desactivada. Contacta al administrador.' 
        };
      }

      // Verificar contraseña (en demo, todas las contraseñas son "password123")
      if (password !== 'password123') {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Contraseña incorrecta. Usa "password123" para la demo.' 
        };
      }

      // Login exitoso
      setUser(userExists);
      localStorage.setItem('current_user', JSON.stringify(userExists));
      
      setIsLoading(false);
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  };

  const register = async (
    email: string, 
    password: string, 
    userData: { name: string; role?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar si el usuario ya existe
      const userExists = await localDataService.getUserByEmail(email);
      
      if (userExists) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Este email ya está registrado en el sistema.' 
        };
      }

      // Crear nuevo usuario (en demo, solo simular)
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: email,
        role: userData.role as any || 'broker',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: userData.role === 'admin' ? ['*'] : ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      };
      
      // En una implementación real, guardarías en la base de datos
      // Por ahora solo simular el registro exitoso
      setUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      
      setIsLoading(false);
      return { success: true };
      
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  };

  const logout = () => {
    setError(null);
    setUser(null);
    localStorage.removeItem('current_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      updateUser,
      login, 
      register, 
      logout, 
      isLoading, 
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