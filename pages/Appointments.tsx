import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, FilePlus, X, AlertCircle, CheckCircle, Star, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Appointment } from '../types';

const Appointments: React.FC = () => {
  const { appointments, patients, doctors, addAppointment, updateAppointment } = useData();
  const [showModal, setShowModal] = useState(false);
  
  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'Check-up'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = doctors.find(d => d.id === formData.doctorId);

    if (patient && doctor && formData.date && formData.time) {
      const newAppointment: Appointment = {
        id: `A${Date.now()}`,
        patientId: patient.id,
        patientName: patient.fullName,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: formData.date,
        time: formData.time,
        status: 'Scheduled',
        type: formData.type as 'Check-up' | 'Emergency' | 'Follow-up'
      };

      addAppointment(newAppointment);
      setShowModal(false);
      setFormData({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        type: 'Check-up'
      });
    }
  };

  const handleCancel = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt && window.confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointment({ ...apt, status: 'Cancelled' });
    }
  };

  const handleComplete = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      updateAppointment({ ...apt, status: 'Completed' });
    }
  };

  const openFeedbackModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setRating(apt.rating || 0);
    setFeedbackComment(apt.feedbackComment || '');
    setShowFeedbackModal(true);
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppointment) {
      updateAppointment({ 
        ...selectedAppointment, 
        rating, 
        feedbackComment 
      });
      setShowFeedbackModal(false);
      setSelectedAppointment(null);
      setRating(0);
      setFeedbackComment('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
          <p className="text-slate-500">Manage schedules and bookings</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-600/20"
        >
          <FilePlus size={18} className="mr-2" />
          New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget Placeholder */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Calendar</h3>
              <div className="flex space-x-2">
                 <button className="p-1 hover:bg-slate-100 rounded">&lt;</button>
                 <button className="p-1 hover:bg-slate-100 rounded">&gt;</button>
              </div>
           </div>
           {/* Simplified Calendar Grid */}
           <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              <div className="text-slate-400 text-xs font-semibold">Su</div>
              <div className="text-slate-400 text-xs font-semibold">Mo</div>
              <div className="text-slate-400 text-xs font-semibold">Tu</div>
              <div className="text-slate-400 text-xs font-semibold">We</div>
              <div className="text-slate-400 text-xs font-semibold">Th</div>
              <div className="text-slate-400 text-xs font-semibold">Fr</div>
              <div className="text-slate-400 text-xs font-semibold">Sa</div>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(31)].map((_, i) => (
                 <div key={i} className={`p-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${i + 1 === 28 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}>
                    {i + 1}
                 </div>
              ))}
           </div>
           <div className="mt-6">
             <h4 className="font-semibold text-slate-800 mb-2">Doctors Available</h4>
             <div className="space-y-2">
                {doctors.slice(0, 3).map(doctor => (
                  <div key={doctor.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${doctor.available ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span>{doctor.name}</span>
                    </div>
                    {/* Placeholder availability times */}
                    <span className="text-slate-500">09:00 - 17:00</span>
                  </div>
                ))}
             </div>
           </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-4 mb-2">
             <span className="font-semibold text-slate-700">Upcoming</span>
             <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          
          {appointments.length === 0 ? (
             <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100">
               No appointments scheduled.
             </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col gap-4 ${apt.status === 'Cancelled' ? 'opacity-60 bg-slate-50' : ''}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      apt.status === 'Cancelled' ? 'bg-slate-200 text-slate-500' :
                      apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                      apt.type === 'Emergency' ? 'bg-red-100 text-red-600' : 
                      apt.type === 'Check-up' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {apt.status === 'Cancelled' ? <X size={24} /> : 
                       apt.status === 'Completed' ? <CheckCircle size={24} /> : 
                       <CalendarIcon size={24} />}
                    </div>
                    <div>
                      <h4 className={`font-bold ${apt.status === 'Cancelled' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{apt.patientName}</h4>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <User size={14} className="mr-1" />
                        {apt.doctorName}
                        <span className="mx-2">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          apt.status === 'Cancelled' ? 'bg-slate-200 text-slate-600' : 
                          apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>{apt.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="flex items-center text-slate-800 font-semibold">
                        <Clock size={16} className="mr-1.5 text-slate-400" />
                        {apt.time}
                      </div>
                      <div className="text-sm text-slate-500">{apt.date}</div>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-end pt-3 border-t border-slate-50 gap-2">
                    {apt.status === 'Scheduled' && (
                        <>
                          <button 
                              onClick={() => handleCancel(apt.id)}
                              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={() => handleComplete(apt.id)}
                              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                          >
                              <CheckCircle size={14} className="mr-1.5" />
                              Mark Complete
                          </button>
                        </>
                    )}
                    
                    {apt.status === 'Completed' && (
                       <button 
                          onClick={() => openFeedbackModal(apt)}
                          className={`px-3 py-1.5 text-sm border rounded-lg transition-colors flex items-center ${
                             apt.rating ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                          }`}
                       >
                          {apt.rating ? (
                             <>
                               <Star size={14} className="mr-1.5 fill-amber-500 text-amber-500" />
                               Rated {apt.rating}/5
                             </>
                          ) : (
                             <>
                               <MessageSquare size={14} className="mr-1.5" />
                               Rate Experience
                             </>
                          )}
                       </button>
                    )}

                    <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                        Details
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4">New Appointment</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <select 
                  name="patientId" 
                  value={formData.patientId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} (ID: {p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
                <select 
                  name="doctorId" 
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input 
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <div className="flex gap-4">
                  {['Check-up', 'Emergency', 'Follow-up'].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        value={type}
                        checked={formData.type === type}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-600/20"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedAppointment && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in relative">
             <button 
               onClick={() => setShowFeedbackModal(false)}
               className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
             >
               <X size={20} />
             </button>

             <div className="text-center mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Star className="text-amber-500" fill="currentColor" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Rate Experience</h3>
                <p className="text-sm text-slate-500 mt-1">
                   How was {selectedAppointment.patientName}'s appointment with {selectedAppointment.doctorName}?
                </p>
             </div>

             <form onSubmit={submitFeedback} className="space-y-6">
                <div className="flex justify-center gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                         <Star 
                           size={32} 
                           className={rating >= star ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} 
                         />
                      </button>
                   ))}
                </div>
                <div className="text-center text-sm font-medium text-slate-600 h-5">
                   {rating === 1 && "Very Poor"}
                   {rating === 2 && "Poor"}
                   {rating === 3 && "Average"}
                   {rating === 4 && "Good"}
                   {rating === 5 && "Excellent"}
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Additional Feedback</label>
                   <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share details about the waiting time, doctor's behavior, etc."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                   ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={rating === 0}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Feedback
                </button>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};

export default Appointments;