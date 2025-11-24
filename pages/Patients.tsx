import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, X, Calendar, Star, MessageSquare, Brain, Activity, AlertTriangle, Loader2, Printer, FileText, Stethoscope } from 'lucide-react';
import { Patient, Gender, Appointment } from '../types';
import { getGeminiResponse } from '../services/gemini';
import { useData } from '../context/DataContext';

const Patients: React.FC = () => {
  const { patients, addPatient, appointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Patient Details Modal
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
  const [historyView, setHistoryView] = useState<'appointments' | 'notes'>('appointments');

  // Triage Modal State
  const [triagePatient, setTriagePatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    contact: '',
    age: '',
    gender: 'Male',
    condition: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPatient: Patient = {
      id: `P${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: formData.fullName,
      age: parseInt(formData.age) || 0,
      gender: formData.gender as Gender,
      contact: formData.contact,
      lastVisit: new Date().toISOString().split('T')[0],
      condition: formData.condition,
      status: 'Outpatient',
      bloodType: 'Unknown',
      notes: []
    };

    addPatient(newPatient);
    setShowAddModal(false);
    setFormData({ fullName: '', contact: '', age: '', gender: 'Male', condition: '' });
  };

  const handleViewHistory = (patient: Patient) => {
    const history = appointments.filter(apt => apt.patientId === patient.id);
    setPatientHistory(history);
    setSelectedPatient(patient);
    setHistoryView('appointments');
  };

  const handlePrintReport = () => {
    if (!selectedPatient) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const historyHtml = patientHistory.length > 0 ? patientHistory.map(apt => `
        <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
             <strong>${apt.date} | ${apt.time}</strong>
             <span style="padding: 2px 8px; border-radius: 12px; background: ${apt.status === 'Completed' ? '#d1e7dd' : '#e2e3e5'}; font-size: 12px;">${apt.status}</span>
          </div>
          <div style="margin-bottom: 5px;"><strong>Doctor:</strong> ${apt.doctorName} (${apt.type})</div>
        </div>
      `).join('') : '<p>No appointment history found.</p>';

      const notesHtml = selectedPatient.notes && selectedPatient.notes.length > 0 ? selectedPatient.notes.map(note => `
         <div style="margin-bottom: 15px; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #e9ecef;">
            <div style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 5px; color: #555; font-size: 12px;">
                ${note.date} - ${note.doctorName} (${note.type})
            </div>
            <div style="white-space: pre-wrap;">${note.content}</div>
         </div>
      `).join('') : '<p>No clinical notes available.</p>';

      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Report - ${selectedPatient.fullName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
              .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
              .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">MedCore HMS</div>
              <div>Patient Medical Report</div>
            </div>
            
            <div class="meta-grid">
              <div><strong>Patient Name:</strong> ${selectedPatient.fullName}</div>
              <div><strong>Patient ID:</strong> ${selectedPatient.id}</div>
              <div><strong>Age / Gender:</strong> ${selectedPatient.age} / ${selectedPatient.gender}</div>
              <div><strong>Condition:</strong> ${selectedPatient.condition}</div>
            </div>

            <div class="section-title">Clinical Notes</div>
            ${notesHtml}

            <div class="section-title">Appointment History</div>
            ${historyHtml}

            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8;">
              Generated on ${new Date().toLocaleString()} by MedCore Hospital Management System
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const openTriageModal = (patient: Patient) => {
    setTriagePatient(patient);
    setSymptoms('');
    setAnalysisResult('');
  };

  const handleTriage = async () => {
    if (!triagePatient || !symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    const prompt = `
      Act as an emergency triage nurse AI.
      Patient: ${triagePatient.fullName}, ${triagePatient.age} years old, ${triagePatient.gender}.
      Known Condition: ${triagePatient.condition}.
      Current Symptoms: "${symptoms}".
      
      Please provide:
      1. Triage Level (Red - Immediate / Yellow - Urgent / Green - Non-urgent)
      2. Top 3 Potential Diagnoses
      3. Recommended Next Steps for the nurse.
      
      Format the response clearly with bold headings.
    `;

    try {
      const response = await getGeminiResponse(prompt, 'gemini-2.5-flash');
      setAnalysisResult(response);
    } catch (error) {
      setAnalysisResult("Error analyzing symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patient Management</h2>
          <p className="text-slate-500">View and manage patient records</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} className="mr-2" />
          Register Patient
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
          <Filter size={18} className="mr-2" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-semibold text-slate-600 text-sm">Patient ID</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Age/Gender</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Condition</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Last Visit</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-500">{patient.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{patient.fullName}</div>
                    <div className="text-xs text-slate-500">{patient.contact}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {patient.age} / <span className="capitalize">{patient.gender}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {patient.condition}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.status === 'Admitted' ? 'bg-red-100 text-red-800' :
                      patient.status === 'Discharged' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{patient.lastVisit}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openTriageModal(patient)}
                          className="flex items-center text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                          title="AI Symptom Triage"
                        >
                          <Brain size={14} className="mr-1" />
                          AI Triage
                        </button>
                        <button 
                           onClick={() => handleViewHistory(patient)}
                           className="text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
                        >
                            History
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Register New Patient</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                  <input 
                    required 
                    type="tel" 
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="555-0000" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input 
                    required 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="30" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Condition</label>
                  <input 
                    type="text" 
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="e.g. Fever, Fracture" 
                  />
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
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Triage Modal */}
      {triagePatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="text-rose-500" size={20} />
                    <h3 className="text-xl font-bold text-slate-800">AI Symptom Triage</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    Patient: <span className="font-semibold text-slate-700">{triagePatient.fullName}</span> ({triagePatient.age}, {triagePatient.gender})
                  </p>
               </div>
               <button onClick={() => setTriagePatient(null)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
               <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reported Symptoms</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Severe headache, sensitivity to light, nausea since morning..."
                    className="w-full h-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    disabled={isAnalyzing}
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={handleTriage}
                      disabled={isAnalyzing || !symptoms.trim()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain size={18} className="mr-2" />
                          Analyze Symptoms
                        </>
                      )}
                    </button>
                  </div>
               </div>

               {analysisResult && (
                 <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold border-b border-slate-200 pb-2">
                       <AlertTriangle className="text-amber-500" size={18} />
                       AI Assessment
                    </div>
                    <div className="prose prose-sm text-slate-700 max-w-none whitespace-pre-wrap leading-relaxed">
                       {analysisResult}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fade-in relative max-h-[85vh] flex flex-col">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
                
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{selectedPatient.fullName}</h3>
                    <p className="text-slate-500 text-sm">Patient Record & History</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4 w-fit">
                    <button 
                        onClick={() => setHistoryView('appointments')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${historyView === 'appointments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Appointments
                    </button>
                    <button 
                         onClick={() => setHistoryView('notes')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${historyView === 'notes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Clinical Notes
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {historyView === 'appointments' ? (
                        patientHistory.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                                No appointments found for this patient.
                            </div>
                        ) : (
                            patientHistory.map(apt => (
                                <div key={apt.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center text-slate-800 font-medium">
                                            <Calendar size={16} className="mr-2 text-blue-500" />
                                            {apt.date} at {apt.time}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                            apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 mb-3">
                                        Doctor: <span className="text-slate-700">{apt.doctorName}</span> • Type: {apt.type}
                                    </div>
                                    
                                    {apt.rating && (
                                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-amber-700 ml-1">
                                                    {apt.rating}.0
                                                </span>
                                            </div>
                                            {apt.feedbackComment && (
                                                <p className="text-sm text-slate-700 italic">"{apt.feedbackComment}"</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )
                    ) : (
                         // Clinical Notes View
                         (!selectedPatient.notes || selectedPatient.notes.length === 0) ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                                <FileText className="mx-auto mb-2 opacity-50" />
                                No clinical notes available.
                            </div>
                         ) : (
                            selectedPatient.notes.map(note => (
                                <div key={note.id} className="border border-slate-100 rounded-xl p-4 bg-yellow-50/30">
                                    <div className="flex justify-between items-start mb-2 border-b border-yellow-100 pb-2">
                                        <div className="flex items-center text-slate-800 text-sm font-medium">
                                            <Stethoscope size={14} className="mr-2 text-slate-400" />
                                            {note.doctorName}
                                        </div>
                                        <span className="text-xs text-slate-400">{note.date}</span>
                                    </div>
                                    <div className="prose prose-sm text-slate-700 whitespace-pre-wrap">
                                        {note.content}
                                    </div>
                                    <div className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {note.type}
                                    </div>
                                </div>
                            ))
                         )
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button 
                        onClick={handlePrintReport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
                    >
                        <Printer size={16} />
                        Print Report
                    </button>
                    <button 
                        onClick={() => setSelectedPatient(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default Patients;