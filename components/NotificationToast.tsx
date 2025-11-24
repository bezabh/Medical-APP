import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useData();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-fade-in-up min-w-[300px] ${
            notification.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' :
            notification.type === 'error' ? 'bg-red-50/90 border-red-100 text-red-800' :
            'bg-blue-50/90 border-blue-100 text-blue-800'
          }`}
        >
          <div className={`mr-3 p-1 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-200/50' :
            notification.type === 'error' ? 'bg-red-200/50' :
            'bg-blue-200/50'
          }`}>
            {notification.type === 'success' && <CheckCircle size={16} />}
            {notification.type === 'error' && <AlertCircle size={16} />}
            {notification.type === 'info' && <Info size={16} />}
          </div>
          <p className="text-sm font-medium flex-1">{notification.message}</p>
          <button 
            onClick={() => removeNotification(notification.id)}
            className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={14} className="opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;