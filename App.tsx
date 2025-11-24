import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Billing from './pages/Billing';
import AiAssistant from './pages/AiAssistant';
import Login from './pages/Login';
import { User } from './types';
import { LanguageProvider, useLanguage } from './services/i18n';
import { DataProvider } from './context/DataContext';
import NotificationToast from './components/NotificationToast';

// Inner App component to use the hook
const InnerApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} />;
      case 'patients':
        return <Patients />;
      case 'doctors':
        return <Doctors />;
      case 'appointments':
        return <Appointments />;
      case 'billing':
        return <Billing />;
      case 'ai-assistant':
        return <AiAssistant />;
      default:
        return <Dashboard user={currentUser} />;
    }
  };

  // If not logged in, show login screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // If logged in, show main app
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        user={currentUser}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto animate-fade-in">
           {renderContent()}
        </div>
      </main>
      
      <NotificationToast />
    </div>
  );
};

// Main App Wrapper
const App: React.FC = () => {
  return (
    <DataProvider>
      <LanguageProvider>
        <InnerApp />
      </LanguageProvider>
    </DataProvider>
  );
};

export default App;