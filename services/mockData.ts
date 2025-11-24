import { Patient, Doctor, Appointment, Gender, User, UserRole, Invoice } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Dr. Gregory House', 
    role: UserRole.ADMIN, 
    email: 'admin@medcore.com',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150'
  },
  { 
    id: 'u2', 
    name: 'Nurse Joy', 
    role: UserRole.NURSE, 
    email: 'nurse@medcore.com',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150&h=150'
  },
  { 
    id: 'u3', 
    name: 'Dr. Strange', 
    role: UserRole.DOCTOR, 
    email: 'doc@medcore.com' 
  },
  { 
    id: 'u4', 
    name: 'Guest Visitor', 
    role: UserRole.GUEST, 
    email: 'guest@medcore.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
  },
  { 
    id: 'u5', 
    name: 'John Normal', 
    role: UserRole.USER, 
    email: 'user@medcore.com'
  }
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', fullName: 'Sarah Connor', age: 34, gender: Gender.FEMALE, contact: '555-0101', lastVisit: '2023-10-25', condition: 'Hypertension', status: 'Outpatient', bloodType: 'A+' },
  { id: 'P002', fullName: 'John Doe', age: 45, gender: Gender.MALE, contact: '555-0102', lastVisit: '2023-10-26', condition: 'Type 2 Diabetes', status: 'Admitted', bloodType: 'O-' },
  { id: 'P003', fullName: 'Emily Blunt', age: 29, gender: Gender.FEMALE, contact: '555-0103', lastVisit: '2023-10-24', condition: 'Migraine', status: 'Outpatient', bloodType: 'B+' },
  { id: 'P004', fullName: 'Michael Smith', age: 52, gender: Gender.MALE, contact: '555-0104', lastVisit: '2023-10-20', condition: 'Post-Op Recovery', status: 'Admitted', bloodType: 'AB+' },
  { id: 'P005', fullName: 'Linda Hamilton', age: 61, gender: Gender.FEMALE, contact: '555-0105', lastVisit: '2023-10-27', condition: 'Arthritis', status: 'Outpatient', bloodType: 'O+' },
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'D001', name: 'Dr. Gregory House', specialty: 'Diagnostician', available: true, patientsInQueue: 2 },
  { id: 'D002', name: 'Dr. Meredith Grey', specialty: 'General Surgery', available: false, patientsInQueue: 5 },
  { id: 'D003', name: 'Dr. Stephen Strange', specialty: 'Neurology', available: true, patientsInQueue: 1 },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: 'A001', 
    patientId: 'P001', 
    patientName: 'Sarah Connor', 
    doctorId: 'D001', 
    doctorName: 'Dr. Gregory House', 
    date: '2023-10-28', 
    time: '09:00', 
    status: 'Completed', 
    type: 'Check-up',
    rating: 5,
    feedbackComment: "Dr. House was surprisingly polite today. Great diagnosis."
  },
  { 
    id: 'A002', 
    patientId: 'P003', 
    patientName: 'Emily Blunt', 
    doctorId: 'D003', 
    doctorName: 'Dr. Stephen Strange', 
    date: '2023-10-28', 
    time: '10:30', 
    status: 'Scheduled', 
    type: 'Follow-up' 
  },
  { 
    id: 'A003', 
    patientId: 'P002', 
    patientName: 'John Doe', 
    doctorId: 'D002', 
    doctorName: 'Dr. Meredith Grey', 
    date: '2023-10-29', 
    time: '14:00', 
    status: 'Scheduled', 
    type: 'Emergency' 
  },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2023-001', patientId: 'P001', patientName: 'Sarah Connor', date: '2023-10-25', amount: 150.00, status: 'Paid', items: ['General Consultation', 'Blood Pressure Check'] },
  { id: 'INV-2023-002', patientId: 'P002', patientName: 'John Doe', date: '2023-10-26', amount: 1200.50, status: 'Pending', items: ['Emergency Room Fee', 'Insulin Administration', 'Overnight Stay'] },
  { id: 'INV-2023-003', patientId: 'P003', patientName: 'Emily Blunt', date: '2023-10-27', amount: 75.00, status: 'Overdue', items: ['Follow-up Consultation'] },
  { id: 'INV-2023-004', patientId: 'P004', patientName: 'Michael Smith', date: '2023-10-28', amount: 5000.00, status: 'Pending', items: ['Surgery - Appendectomy', 'Anesthesia'] },
];