import { useState, useEffect } from 'react';
import { localDataService } from '../services/localDataService';
import { RefreshCw } from 'lucide-react';
import type { User } from '../types';

interface SupabaseHookReturn {
  user: User | null;
  loading: boolean;
  connected: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  // New methods for the complete system
  getUserPointsSummary: (userId: string, month?: number, year?: number) => Promise<any>;
  getLeaderboard: (month?: number, year?: number, limit?: number) => Promise<any[]>;
  createNotification: (userId: string, title: string, message: string, type?: string, actionUrl?: string, metadata?: any) => Promise<any>;
  getNotifications: (userId: string, unreadOnly?: boolean) => Promise<any[]>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  refreshConnection: () => Promise<boolean>;
}

export const useSupabase = (): SupabaseHookReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true); // Siempre conectado en modo local

  useEffect(() => {
    // Inicializar datos locales
    const initializeLocal = async () => {
      try {
        localDataService.initializeDemoData();
        
        // Verificar sesión local
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error inicializando datos locales:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeLocal();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Simular login local
      const userExists = await localDataService.getUserByEmail(email);
      if (userExists && password === 'password123') {
        setUser(userExists);
        localStorage.setItem('current_user', JSON.stringify(userExists));
        return { success: true, data: userExists };
      }
      return { success: false, error: 'Credenciales incorrectas' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('current_user');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  // Extended methods for the complete system
  const getUserPointsSummary = async (userId: string, month?: number, year?: number) => {
    return await localDataService.getUserPointsSummary(userId);
  };

  const getLeaderboard = async (month?: number, year?: number, limit?: number) => {
    return await localDataService.getLeaderboard();
  };

  const createNotification = async (
    userId: string, 
    title: string, 
    message: string, 
    type?: string, 
    actionUrl?: string, 
    metadata?: any
  ) => {
    // Simular creación de notificación
    return { id: Date.now().toString(), success: true };
  };

  const getNotifications = async (userId: string, unreadOnly?: boolean) => {
    // Simular notificaciones
    return [];
  };

  const markNotificationAsRead = async (notificationId: string) => {
    // Simular marcar como leída
    return;
  };

  const refreshConnection = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const isConnected = await localDataService.testConnection();
      setConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Error refreshing connection:', error);
      setConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    connected,
    signIn,
    signOut,
    getUserPointsSummary,
    getLeaderboard,
    createNotification,
    getNotifications,
    markNotificationAsRead,
    refreshConnection,
  };
};