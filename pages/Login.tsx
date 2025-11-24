import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, Loader2, Globe } from 'lucide-react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { useLanguage, Language } from '../services/i18n';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@medcore.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { t, language, setLanguage } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      
      let isValid = false;
      if (user) {
        if (user.role === 'ADMIN' && password === 'admin123') isValid = true;
        if (user.role === 'GUEST' && password === 'guest123') isValid = true;
        if (user.role === 'USER' && password === 'user123') isValid = true;
        if (['DOCTOR', 'NURSE'].includes(user.role) && password === 'admin123') isValid = true;
      }
      
      if (isValid && user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check the demo accounts below.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-emerald-400/10 blur-[80px]"></div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2 z-10">
         {/* Language Toggles for Login Screen */}
         {(['en', 'am', 'ti'] as Language[]).map((lang) => (
             <button
               key={lang}
               onClick={() => setLanguage(lang)}
               className={`px-3 py-1 rounded-full text-xs font-medium transition-all transform hover:scale-105 ${
                 language === lang 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                 : 'bg-white/80 backdrop-blur-sm text-slate-500 hover:bg-white border border-slate-200'
               }`}
             >
               {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'ትግ'}
             </button>
         ))}
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col md:flex-row border border-white/50 z-10">
        
        {/* Login Form */}
        <div className="p-8 w-full">
          <div className="flex items-center space-x-2 mb-8 justify-center">
            <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity size={22} className="text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
               <span className="text-2xl font-bold text-slate-800 tracking-tight leading-none">MedCore</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">System Login</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">{t('welcomeBack')}</h2>
          <p className="text-slate-500 text-center mb-8 text-sm">{t('signInSubtitle')}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('email')}</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  placeholder="name@hospital.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('password')}</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center animate-fade-in border border-red-100">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {t('signIn')}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">{t('demoCredentials')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-all group" onClick={() => { setEmail('admin@medcore.com'); setPassword('admin123'); }}>
                <span className="font-bold block text-blue-600 mb-0.5 group-hover:text-blue-700">Admin</span>
                <span className="text-slate-500">admin123</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all group" onClick={() => { setEmail('user@medcore.com'); setPassword('user123'); }}>
                <span className="font-bold block text-emerald-600 mb-0.5 group-hover:text-emerald-700">User</span>
                <span className="text-slate-500">user123</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-100 transition-all group" onClick={() => { setEmail('guest@medcore.com'); setPassword('guest123'); }}>
                <span className="font-bold block text-purple-600 mb-0.5 group-hover:text-purple-700">Guest</span>
                <span className="text-slate-500">guest123</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all group" onClick={() => { setEmail('doc@medcore.com'); setPassword('admin123'); }}>
                <span className="font-bold block text-orange-600 mb-0.5 group-hover:text-orange-700">Doctor</span>
                <span className="text-slate-500">admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-slate-400 text-xs font-medium">
         © {new Date().getFullYear()} MedCore Hospital System
      </div>
    </div>
  );
};

export default Login;