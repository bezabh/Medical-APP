import React, { useState } from 'react';
import { Search, Plus, Stethoscope, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Doctor } from '../types';

const Doctors: React.FC = () => {
  const { doctors, addDoctor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    available: 'true',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoctor: Doctor = {
      id: `D${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      specialty: formData.specialty,
      available: formData.available === 'true',
      patientsInQueue: 0
    };

    addDoctor(newDoctor);
    setShowAddModal(false);
    setFormData({ name: '', specialty: '', available: 'true' });
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Medical Staff</h2>
          <p className="text-slate-500">Manage doctors and specialists</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} className="mr-2" />
          Add Doctor
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search doctors by name or specialty..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {doctor.name.charAt(0)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                doctor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {doctor.available ? 'Available' : 'Off Duty'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{doctor.name}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4 flex items-center">
              <Stethoscope size={14} className="mr-1.5" />
              {doctor.specialty}
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-500">
                <User size={14} className="mr-1.5" />
                {doctor.patientsInQueue} Patients Waiting
              </div>
              <button className="text-blue-600 font-medium hover:text-blue-700">View Profile</button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Medical Professional</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Name</label>
                <input 
                  required 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="Dr. John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                <input 
                  required 
                  type="text" 
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="Cardiology" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  name="available"
                  value={formData.available}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="true">Available</option>
                  <option value="false">Off Duty</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-600/20"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;