export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  GUEST = 'GUEST',
  USER = 'USER'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  doctorId: string;
  doctorName: string;
  content: string;
  type: 'General' | 'Diagnosis' | 'Prescription' | 'Discharge Summary';
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  contact: string;
  lastVisit: string;
  condition: string;
  status: 'Admitted' | 'Discharged' | 'Outpatient';
  bloodType?: string;
  notes?: ClinicalNote[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  patientsInQueue: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  type: 'Check-up' | 'Emergency' | 'Follow-up';
  rating?: number; // 1-5 stars
  feedbackComment?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: string[];
}

export interface DashboardStats {
  totalPatients: number;
  activeDoctors: number;
  appointmentsToday: number;
  pendingReports: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}