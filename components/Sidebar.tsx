import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Calendar, MessageSquare, Settings, Activity, LogOut, Stethoscope, CreditCard, Globe, Download } from 'lucide-react';
import { User } from '../types';
import { useLanguage, Language } from '../services/i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, user }) => {
  const { t, language, setLanguage } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'patients', label: t('patients'), icon: Users },
    { id: 'doctors', label: t('doctors'), icon: Stethoscope },
    { id: 'appointments', label: t('appointments'), icon: Calendar },
    { id: 'billing', label: t('billing'), icon: CreditCard },
    { id: 'ai-assistant', label: t('aiAssistant'), icon: MessageSquare },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'ti', label: 'ትግርኛ' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50">
      <div className="p-6 border-b border-slate-800/50 flex items-center space-x-3">
        <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity size={24} className="text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
        </div>
        <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight leading-none">MedCore</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{t('hospitalOs')}</span>
        </div>
      </div>

      {/* User Mini Profile */}
      {user && (
        <div className="px-4 mt-6 mb-2">
          <div className="flex items-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 overflow-hidden ring-2 ring-slate-700/50">
               {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/> : user.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon size={20} className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        
        {/* PWA Install Button (Only visible if installable) */}
        {deferredPrompt && (
           <button 
             onClick={handleInstallClick}
             className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
           >
             <Download size={16} />
             <span className="text-sm font-bold">Install App</span>
           </button>
        )}

        {/* Language Selector */}
        <div className="mb-4 px-2">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Globe size={14} />
                <span className="text-xs uppercase font-semibold tracking-wider">Language / ቋንቋ</span>
            </div>
            <div className="flex gap-2">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`text-xs px-2 py-1 rounded-md border transition-all ${
                            language === lang.code 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>

        <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors">
          <Settings size={20} />
          <span className="font-medium">{t('settings')}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-xl transition-colors mt-2"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;