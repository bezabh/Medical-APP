import React from 'react';
import { 
  Users, Activity, CalendarCheck, FileText, 
  TrendingUp, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import StatCard from '../components/StatCard';
import { User } from '../types';
import { useLanguage } from '../services/i18n';
import { useData } from '../context/DataContext';

const chartData = [
  { name: 'Mon', patients: 45, emergencies: 12 },
  { name: 'Tue', patients: 52, emergencies: 8 },
  { name: 'Wed', patients: 38, emergencies: 15 },
  { name: 'Thu', patients: 65, emergencies: 10 },
  { name: 'Fri', patients: 48, emergencies: 22 },
  { name: 'Sat', patients: 30, emergencies: 5 },
  { name: 'Sun', patients: 25, emergencies: 18 },
];

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { t } = useLanguage();
  const { patients, doctors, appointments, invoices } = useData();

  // Calculate real-time stats
  const totalPatients = patients.length;
  const activeAppointments = appointments.filter(a => a.status === 'Scheduled').length;
  const criticalPatients = patients.filter(p => p.status === 'Admitted').length;
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue);

  // Get recent clinical notes or activity logic
  const recentActivities = [
     ...appointments.slice(0, 2).map(a => ({
         type: 'Appointment',
         title: `New Appointment: ${a.patientName}`,
         desc: `Scheduled with ${a.doctorName}`,
         time: 'Recently'
     })),
     ...patients.slice(0, 1).map(p => ({
         type: 'Registration',
         title: `New Patient Registered`,
         desc: `${p.fullName} (${p.condition})`,
         time: 'Just now'
     }))
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('overview')}</h2>
          <p className="text-slate-500">{t('welcomeUser')}, {user ? user.name : 'Doctor'}</p>
        </div>
        <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 font-medium flex items-center">
          <Activity size={14} className="mr-2" />
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label={t('totalPatients')}
          value={totalPatients.toLocaleString()} 
          icon={Users} 
          trend="Live" 
          trendUp={true} 
          color="bg-blue-500" 
        />
        <StatCard 
          label={t('appointments')} 
          value={activeAppointments} 
          icon={CalendarCheck} 
          trend="Pending" 
          trendUp={true} 
          color="bg-violet-500" 
        />
        <StatCard 
          label="Admitted Cases" 
          value={criticalPatients} 
          icon={Activity} 
          trend="Critical" 
          trendUp={false} 
          color="bg-rose-500" 
        />
        <StatCard 
          label={t('earnings')} 
          value={formattedRevenue} 
          icon={TrendingUp} 
          trend="Total" 
          trendUp={true} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('patientFlow')}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('departmentActivity')}</h3>
          <div className="h-48 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="emergencies" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-slate-500">Emergency</span>
                <span className="font-bold text-slate-800">42%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{width: '42%'}}></div>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-500">Outpatient</span>
                <span className="font-bold text-slate-800">58%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '58%'}}></div>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('recentUpdates')}</h3>
        <div className="space-y-4">
          {recentActivities.map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-b border-slate-50 last:border-0">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${activity.type === 'Registration' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{activity.title}</h4>
                  <p className="text-xs text-slate-500">{activity.desc}</p>
                </div>
              </div>
              <div className="flex items-center text-xs text-slate-400">
                <Clock size={14} className="mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;