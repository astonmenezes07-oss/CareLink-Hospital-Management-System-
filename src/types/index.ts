// ============================================================
// CareLink — Type Definitions
// ============================================================

// --- Priority & Triage ---

export type PriorityLevel = 'high' | 'medium' | 'low';

export type TriageCategory = 'A' | 'B' | 'C' | 'D' | 'none';

export interface PriorityScore {
  total: number;           // 0–100
  level: PriorityLevel;
  triageCategory: TriageCategory;
  symptomScore: number;
  ageScore: number;
  vitalScore: number;
  conditionScore: number;
  emergencyBonus: number;
  reasoning: string;
  recommendedAction: string;
}

// --- Users ---

export interface Patient {
  id: string;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: string;
}

export interface Admin {
  id: string;
  adminId: string;
  name: string;
  passwordHash: string;
  role: 'super_admin' | 'admin';
}

// --- Hospital ---

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;       // emoji
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialization: string;
  qualification: string;
  experience: number;  // years
  availability: DoctorAvailability;
  currentPatients: number;
  maxPatients: number;
  avatar: string;      // initials fallback
}

export interface DoctorAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string;  // "09:00"
  end: string;    // "17:00"
}

// --- Appointments ---

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_queue'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;           // ISO date string
  timeSlot: string;       // "09:00 - 09:30"
  symptoms: string;
  symptomDetails?: string;
  vitalSigns?: VitalSigns;
  existingConditions?: string[];
  reportFiles?: string[];  // file names
  priority: PriorityScore;
  status: AppointmentStatus;
  queuePosition?: number;
  estimatedWaitTime?: number; // minutes
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

// --- Queue ---

export interface QueueEntry {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  departmentId: string;
  priority: PriorityScore;
  status: 'waiting' | 'in_progress' | 'completed';
  checkInTime: string;
  estimatedWaitTime: number;
  position: number;
}

// --- Notifications ---

export type NotificationType =
  | 'appointment_confirmed'
  | 'queue_update'
  | 'priority_changed'
  | 'appointment_reminder'
  | 'emergency_alert'
  | 'treatment_complete';

export interface Notification {
  id: string;
  patientId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// --- Auth ---

export interface AuthSession {
  userId: string;
  role: 'patient' | 'admin';
  username: string;
  name: string;
  expiresAt: string;
}

// --- Analytics ---

export interface QueueStats {
  totalInQueue: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  averageWaitTime: number;
  patientsServedToday: number;
  emergencyCount: number;
}

export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  totalAppointments: number;
  currentQueue: number;
  avgWaitTime: number;
  doctorsAvailable: number;
}
