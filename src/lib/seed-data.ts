// ============================================================
// CareLink — Seed Data
// ============================================================

import {
  Department,
  Doctor,
  Admin,
  Patient,
  Appointment,
  Notification,
  DoctorAvailability,
} from '@/types';
import { analyzeSymptoms } from './symptom-analyzer';

const DEFAULT_AVAILABILITY: DoctorAvailability = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [{ start: '09:00', end: '13:00' }],
  sunday: [],
};

// ---- Departments ----

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-emergency',
    name: 'Emergency Medicine',
    description: 'Acute care for life-threatening conditions and injuries',
    icon: '🚨',
  },
  {
    id: 'dept-cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system disorders',
    icon: '❤️',
  },
  {
    id: 'dept-neurology',
    name: 'Neurology',
    description: 'Brain, spinal cord, and nervous system conditions',
    icon: '🧠',
  },
  {
    id: 'dept-orthopedics',
    name: 'Orthopedics',
    description: 'Bones, joints, muscles, and skeletal system',
    icon: '🦴',
  },
  {
    id: 'dept-general',
    name: 'General Medicine',
    description: 'Primary care, routine checkups, and general health',
    icon: '🩺',
  },
  {
    id: 'dept-pediatrics',
    name: 'Pediatrics',
    description: 'Medical care for infants, children, and adolescents',
    icon: '👶',
  },
];

// ---- Doctors ----

export const DOCTORS: Doctor[] = [
  // Emergency
  {
    id: 'doc-1',
    name: 'Dr. Sarah Mitchell',
    departmentId: 'dept-emergency',
    specialization: 'Emergency Medicine',
    qualification: 'MD, FACEP',
    experience: 14,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 2,
    maxPatients: 8,
    avatar: 'SM',
  },
  {
    id: 'doc-2',
    name: 'Dr. James Rodriguez',
    departmentId: 'dept-emergency',
    specialization: 'Trauma Surgery',
    qualification: 'MD, FACS',
    experience: 18,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 3,
    maxPatients: 8,
    avatar: 'JR',
  },
  // Cardiology
  {
    id: 'doc-3',
    name: 'Dr. Emily Chen',
    departmentId: 'dept-cardiology',
    specialization: 'Interventional Cardiology',
    qualification: 'MD, FACC',
    experience: 16,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 4,
    maxPatients: 10,
    avatar: 'EC',
  },
  {
    id: 'doc-4',
    name: 'Dr. Michael Thompson',
    departmentId: 'dept-cardiology',
    specialization: 'Electrophysiology',
    qualification: 'MD, PhD',
    experience: 12,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 3,
    maxPatients: 10,
    avatar: 'MT',
  },
  // Neurology
  {
    id: 'doc-5',
    name: 'Dr. Priya Sharma',
    departmentId: 'dept-neurology',
    specialization: 'Neurological Surgery',
    qualification: 'MD, DM',
    experience: 20,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 2,
    maxPatients: 8,
    avatar: 'PS',
  },
  {
    id: 'doc-6',
    name: 'Dr. David Kim',
    departmentId: 'dept-neurology',
    specialization: 'Clinical Neurology',
    qualification: 'MD, FAAN',
    experience: 10,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 5,
    maxPatients: 10,
    avatar: 'DK',
  },
  // Orthopedics
  {
    id: 'doc-7',
    name: 'Dr. Robert Williams',
    departmentId: 'dept-orthopedics',
    specialization: 'Joint Replacement',
    qualification: 'MD, MS Ortho',
    experience: 15,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 4,
    maxPatients: 10,
    avatar: 'RW',
  },
  {
    id: 'doc-8',
    name: 'Dr. Lisa Anderson',
    departmentId: 'dept-orthopedics',
    specialization: 'Sports Medicine',
    qualification: 'MD, FAAOS',
    experience: 9,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 3,
    maxPatients: 10,
    avatar: 'LA',
  },
  // General Medicine
  {
    id: 'doc-9',
    name: 'Dr. Aisha Patel',
    departmentId: 'dept-general',
    specialization: 'Internal Medicine',
    qualification: 'MD, FACP',
    experience: 11,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 6,
    maxPatients: 15,
    avatar: 'AP',
  },
  {
    id: 'doc-10',
    name: 'Dr. Thomas Moore',
    departmentId: 'dept-general',
    specialization: 'Family Medicine',
    qualification: 'MD, AAFP',
    experience: 8,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 5,
    maxPatients: 15,
    avatar: 'TM',
  },
  // Pediatrics
  {
    id: 'doc-11',
    name: 'Dr. Maria Garcia',
    departmentId: 'dept-pediatrics',
    specialization: 'General Pediatrics',
    qualification: 'MD, FAAP',
    experience: 13,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 4,
    maxPatients: 12,
    avatar: 'MG',
  },
  {
    id: 'doc-12',
    name: 'Dr. Kevin O\'Brien',
    departmentId: 'dept-pediatrics',
    specialization: 'Pediatric Emergency',
    qualification: 'MD, FACEP',
    experience: 11,
    availability: DEFAULT_AVAILABILITY,
    currentPatients: 3,
    maxPatients: 12,
    avatar: 'KO',
  },
];

// ---- Admin ----

export const ADMINS: Admin[] = [
  {
    id: 'admin-1',
    adminId: 'admin001',
    name: 'Hospital Administrator',
    passwordHash: 'carelink2024',
    role: 'super_admin',
  },
];

// ---- Sample patients ----

export const SAMPLE_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    fullName: 'John Smith',
    username: 'johnsmith',
    email: 'john@example.com',
    passwordHash: 'password123',
    phone: '+1-555-0101',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    bloodGroup: 'O+',
    medicalHistory: ['hypertension'],
    allergies: ['penicillin'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pat-2',
    fullName: 'Emma Johnson',
    username: 'emmaj',
    email: 'emma@example.com',
    passwordHash: 'password123',
    phone: '+1-555-0102',
    dateOfBirth: '1992-07-22',
    gender: 'female',
    bloodGroup: 'A+',
    medicalHistory: [],
    allergies: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pat-3',
    fullName: 'Raj Kumar',
    username: 'rajk',
    email: 'raj@example.com',
    passwordHash: 'password123',
    phone: '+1-555-0103',
    dateOfBirth: '1970-11-05',
    gender: 'male',
    bloodGroup: 'B+',
    medicalHistory: ['diabetes', 'heart disease'],
    allergies: ['sulfa'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pat-4',
    fullName: 'Sophie Lee',
    username: 'sophiel',
    email: 'sophie@example.com',
    passwordHash: 'password123',
    phone: '+1-555-0104',
    dateOfBirth: '2018-02-14',
    gender: 'female',
    bloodGroup: 'AB+',
    medicalHistory: ['asthma'],
    allergies: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pat-5',
    fullName: 'Michael Davis',
    username: 'michaeld',
    email: 'michael@example.com',
    passwordHash: 'password123',
    phone: '+1-555-0105',
    dateOfBirth: '1958-09-30',
    gender: 'male',
    bloodGroup: 'O-',
    medicalHistory: ['hypertension', 'diabetes'],
    allergies: ['aspirin'],
    createdAt: new Date().toISOString(),
  },
];

// ---- Sample appointments ----

function buildSampleAppointments(): Appointment[] {
  const today = new Date();
  const appointments: Appointment[] = [];

  const samples = [
    {
      patientId: 'pat-3',
      doctorId: 'doc-3',
      departmentId: 'dept-cardiology',
      symptoms: 'Chest pain and shortness of breath',
      timeSlot: '09:00 - 09:30',
      status: 'in_queue' as const,
    },
    {
      patientId: 'pat-5',
      doctorId: 'doc-9',
      departmentId: 'dept-general',
      symptoms: 'High fever and weakness for 3 days',
      timeSlot: '10:00 - 10:30',
      status: 'in_queue' as const,
    },
    {
      patientId: 'pat-4',
      doctorId: 'doc-11',
      departmentId: 'dept-pediatrics',
      symptoms: 'Mild cough and runny nose',
      timeSlot: '11:00 - 11:30',
      status: 'confirmed' as const,
    },
    {
      patientId: 'pat-1',
      doctorId: 'doc-7',
      departmentId: 'dept-orthopedics',
      symptoms: 'Severe pain in left knee after fall',
      timeSlot: '09:30 - 10:00',
      status: 'in_queue' as const,
    },
    {
      patientId: 'pat-2',
      doctorId: 'doc-9',
      departmentId: 'dept-general',
      symptoms: 'Routine checkup and vaccination',
      timeSlot: '14:00 - 14:30',
      status: 'pending' as const,
    },
  ];

  samples.forEach((s, i) => {
    const patient = SAMPLE_PATIENTS.find((p) => p.id === s.patientId);
    const age = patient?.dateOfBirth
      ? Math.floor(
          (today.getTime() - new Date(patient.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : undefined;

    const priority = analyzeSymptoms(
      s.symptoms,
      age,
      undefined,
      patient?.medicalHistory
    );

    appointments.push({
      id: `apt-${i + 1}`,
      patientId: s.patientId,
      doctorId: s.doctorId,
      departmentId: s.departmentId,
      date: today.toISOString().split('T')[0],
      timeSlot: s.timeSlot,
      symptoms: s.symptoms,
      priority,
      status: s.status,
      queuePosition: s.status === 'in_queue' ? i + 1 : undefined,
      estimatedWaitTime: s.status === 'in_queue' ? (i + 1) * 15 : undefined,
      createdAt: new Date(today.getTime() - (5 - i) * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return appointments;
}

// ---- Sample notifications ----

function buildSampleNotifications(): Notification[] {
  return [
    {
      id: 'notif-1',
      patientId: 'pat-3',
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message:
        'Your cardiology appointment with Dr. Emily Chen has been confirmed for today.',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      patientId: 'pat-3',
      type: 'queue_update',
      title: 'Queue Update',
      message:
        'You are currently #1 in the queue. Estimated wait: 5 minutes.',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'notif-3',
      patientId: 'pat-1',
      type: 'priority_changed',
      title: 'Priority Updated',
      message:
        'Your priority has been updated to Medium based on your symptoms.',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

// ---- Export seed bundle ----

export function getSeedData() {
  return {
    departments: DEPARTMENTS,
    doctors: DOCTORS,
    admins: ADMINS,
    patients: SAMPLE_PATIENTS,
    appointments: buildSampleAppointments(),
    notifications: buildSampleNotifications(),
  };
}
