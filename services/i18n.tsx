import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'am' | 'ti';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    doctors: 'Doctors',
    appointments: 'Appointments',
    billing: 'Billing',
    aiAssistant: 'AI Assistant',
    settings: 'Settings',
    logout: 'Logout',
    hospitalOs: 'Hospital OS',
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to access your dashboard',
    email: 'Email Address',
    password: 'Password',
    signIn: 'Sign In',
    demoCredentials: 'Demo Credentials',
    overview: 'Hospital Overview',
    welcomeUser: 'Welcome back',
    totalPatients: 'Total Patients',
    surgeries: 'Surgeries',
    earnings: 'Earnings',
    recentUpdates: 'Recent Updates',
    departmentActivity: 'Department Activity',
    patientFlow: 'Patient Flow Statistics'
  },
  am: {
    dashboard: 'ዳሽቦርድ',
    patients: 'ታካሚዎች',
    doctors: 'ዶክተሮች',
    appointments: 'ቀጠሮዎች',
    billing: 'ክፍያ',
    aiAssistant: 'AI ረዳት',
    settings: 'መቼቶች',
    logout: 'ውጣ',
    hospitalOs: 'ሆስፒታል OS',
    welcomeBack: 'እንኳን ደህና መጡ',
    signInSubtitle: 'ወደ ዳሽቦርድ ለመግባት ይግቡ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    signIn: 'ግባ',
    demoCredentials: 'የሙከራ መለያዎች',
    overview: 'የሆስፒታል አጠቃላይ እይታ',
    welcomeUser: 'እንኳን ደህና መጡ',
    totalPatients: 'ጠቅላላ ታካሚዎች',
    surgeries: 'ቀዶ ጥገናዎች',
    earnings: 'ገቢ',
    recentUpdates: 'የቅርብ ጊዜ ዝመናዎች',
    departmentActivity: 'የክፍል እንቅስቃሴ',
    patientFlow: 'የታካሚ ፍሰት ስታቲስቲክስ'
  },
  ti: {
    dashboard: 'ዳሽቦርድ',
    patients: 'ሕሙማት',
    doctors: 'ሓካይም',
    appointments: 'ቆጸራታት',
    billing: 'ክፍሊት',
    aiAssistant: 'AI ሓጋዚ',
    settings: 'ቅጥዕታት',
    logout: 'ውጻእ',
    hospitalOs: 'ሆስፒታል OS',
    welcomeBack: 'እንቋዕ ብደሓን መጻእኩም',
    signInSubtitle: 'ናብ ዳሽቦርድኩም ንምእታው ይእተዉ',
    email: 'ኢሜይል',
    password: 'መሕለፊ ቃል',
    signIn: 'እተው',
    demoCredentials: 'ናይ ፈተነ መለለይ',
    overview: 'ሓፈሻዊ ሆስፒታል',
    welcomeUser: 'እንቋዕ ብደሓን መጻእኩም',
    totalPatients: 'ጠቕላላ ሕሙማት',
    surgeries: 'ቀዶ ሕክምና',
    earnings: 'አታዊ',
    recentUpdates: 'ናይ ቀረባ እዋን ሓበሬታ',
    departmentActivity: 'ንጥፈታት ክፍሊ',
    patientFlow: 'ስታቲስቲክስ ፍሰት ሕሙማት'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};