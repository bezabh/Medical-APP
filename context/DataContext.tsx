import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Patient, Doctor, Appointment, Invoice, AppNotification, ClinicalNote, User } from '../types';
import { MOCK_PATIENTS, MOCK_DOCTORS, MOCK_APPOINTMENTS, MOCK_INVOICES } from '../services/mockData';

interface DataContextType {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  invoices: Invoice[];
  notifications: AppNotification[];
  
  // Actions
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  addClinicalNote: (patientId: string, note: ClinicalNote) => void;
  
  addDoctor: (doctor: Doctor) => void;
  
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Patient Actions
  const addPatient = (patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
    showNotification('success', `Patient ${patient.fullName} registered successfully.`);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const addClinicalNote = (patientId: string, note: ClinicalNote) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const updatedNotes = p.notes ? [note, ...p.notes] : [note];
        return { ...p, notes: updatedNotes };
      }
      return p;
    }));
    showNotification('success', 'Clinical note added to patient record.');
  };

  // Doctor Actions
  const addDoctor = (doctor: Doctor) => {
    setDoctors(prev => [doctor, ...prev]);
    showNotification('success', `Dr. ${doctor.name} added to staff.`);
  };

  // Appointment Actions
  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [appointment, ...prev]);
    showNotification('success', 'Appointment scheduled successfully.');
  };

  const updateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
    
    if (updatedAppointment.status === 'Cancelled') {
        showNotification('info', 'Appointment cancelled.');
    } else if (updatedAppointment.status === 'Completed') {
        showNotification('success', 'Appointment marked as complete.');
    }
  };

  // Invoice Actions
  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    showNotification('success', 'Invoice generated successfully.');
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
  };

  return (
    <DataContext.Provider value={{
      patients, doctors, appointments, invoices, notifications,
      addPatient, updatePatient, addClinicalNote,
      addDoctor,
      addAppointment, updateAppointment,
      addInvoice, updateInvoice,
      showNotification, removeNotification
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};