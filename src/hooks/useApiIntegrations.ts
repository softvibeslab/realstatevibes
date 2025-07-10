import { useState, useEffect } from 'react';
import { ghlService } from '../services/ghlService';
import { vapiService } from '../services/vapiService';
import { n8nService } from '../services/n8nService';
import { evolutionApiService } from '../services/evolutionApiService';

interface IntegrationStatus {
  ghl: boolean;
  vapi: boolean;
  n8n: boolean;
  whatsapp: boolean;
}

interface IntegrationError {
  service: string;
  error: string;
  timestamp: Date;
}

export const useApiIntegrations = () => {
  const [status, setStatus] = useState<IntegrationStatus>({
    ghl: false,
    vapi: false,
    n8n: false,
    whatsapp: false,
  });
  
  const [errors, setErrors] = useState<IntegrationError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const testConnections = async () => {
    setIsLoading(true);
    const newErrors: IntegrationError[] = [];
    const newStatus: IntegrationStatus = {
      ghl: false,
      vapi: false,
      n8n: false,
      whatsapp: false,
    };

    // Test GoHighLevel
    try {
      newStatus.ghl = await ghlService.testConnection();
    } catch (error) {
      newErrors.push({
        service: 'GoHighLevel',
        error: (error as Error).message,
        timestamp: new Date(),
      });
    }

    // Test VAPI
    try {
      newStatus.vapi = await vapiService.testConnection();
    } catch (error) {
      newErrors.push({
        service: 'VAPI',
        error: (error as Error).message,
        timestamp: new Date(),
      });
    }

    // Test n8n
    try {
      newStatus.n8n = await n8nService.testConnection();
    } catch (error) {
      newErrors.push({
        service: 'n8n',
        error: (error as Error).message,
        timestamp: new Date(),
      });
    }

    // Test WhatsApp (Evolution API)
    try {
      newStatus.whatsapp = await evolutionApiService.testConnection();
    } catch (error) {
      newErrors.push({
        service: 'WhatsApp',
        error: (error as Error).message,
        timestamp: new Date(),
      });
    }

    setStatus(newStatus);
    setErrors(newErrors);
    setLastChecked(new Date());
    setIsLoading(false);
  };

  const retryConnection = async (service: keyof IntegrationStatus) => {
    try {
      let success = false;
      
      switch (service) {
        case 'ghl':
          success = await ghlService.testConnection();
          break;
        case 'vapi':
          success = await vapiService.testConnection();
          break;
        case 'n8n':
          success = await n8nService.testConnection();
          break;
        case 'whatsapp':
          success = await evolutionApiService.testConnection();
          break;
      }

      setStatus(prev => ({ ...prev, [service]: success }));
      
      if (success) {
        setErrors(prev => prev.filter(error => 
          error.service.toLowerCase() !== service
        ));
      }

      return success;
    } catch (error) {
      const newError: IntegrationError = {
        service: service.toUpperCase(),
        error: (error as Error).message,
        timestamp: new Date(),
      };
      
      setErrors(prev => [...prev.filter(e => e.service !== newError.service), newError]);
      return false;
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const getConnectionSummary = () => {
    const total = Object.keys(status).length;
    const connected = Object.values(status).filter(Boolean).length;
    const percentage = Math.round((connected / total) * 100);
    
    return {
      total,
      connected,
      disconnected: total - connected,
      percentage,
      hasErrors: errors.length > 0,
    };
  };

  useEffect(() => {
    testConnections();
    
    // Set up periodic health checks every 5 minutes
    const interval = setInterval(testConnections, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    errors,
    isLoading,
    lastChecked,
    testConnections,
    retryConnection,
    clearErrors,
    getConnectionSummary,
  };
};