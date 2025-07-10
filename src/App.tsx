import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { localDataService } from './services/localDataService';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LeadsManager from './components/LeadsManager';
import BrokersManager from './components/BrokersManager';
import MeetingsManager from './components/MeetingsManager';
import ScriptsManager from './components/ScriptsManager';
import CallsManager from './components/CallsManager';
import ReportsManager from './components/ReportsManager';
import IntegrationsManager from './components/IntegrationsManager';
import DayByDayManager from './components/DayByDayManager';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [dataInitialized, setDataInitialized] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  // Inicializar datos locales
  React.useEffect(() => {
    const initializeData = async () => {
      try {
        // Inicializar datos demo
        localDataService.initializeDemoData();
        console.log('Datos locales inicializados correctamente');
        
      } catch (error) {
        console.error('Error inicializando datos locales:', error);
      } finally {
        setDataInitialized(true);
      }
    };
    
    initializeData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <LeadsManager />;
      case 'brokers':
        return <BrokersManager />;
      case 'meetings':
        return <MeetingsManager />;
      case 'scripts':
        return <ScriptsManager />;
      case 'calls':
        return <CallsManager />;
      case 'reports':
        return <ReportsManager />;
      case 'day-by-day':
        return <DayByDayManager />; 
      case 'integrations':
        return user.role === 'admin' ? <IntegrationsManager /> : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceso Denegado</h2>
            <p className="text-slate-600">No tienes permisos para acceder a esta sección</p>
          </div>
        );
      case 'settings':
        return user.role === 'admin' ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Configuración del Sistema</h2>
            <p className="text-slate-600">Próximamente disponible</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceso Denegado</h2>
            <p className="text-slate-600">No tienes permisos para acceder a esta sección</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;