// ============================================================
// CareLink — Data Store  (localStorage persistence)
// ============================================================

import {
  Patient,
  Admin,
  Doctor,
  Department,
  Appointment,
  Notification,
  QueueEntry,
  AuthSession,
  AppointmentStatus,
} from '@/types';
import { getSeedData } from './seed-data';
import { PriorityQueue } from './priority-queue';

const KEYS = {
  patients: 'carelink_patients',
  admins: 'carelink_admins',
  doctors: 'carelink_doctors',
  departments: 'carelink_departments',
  appointments: 'carelink_appointments',
  notifications: 'carelink_notifications',
  queue: 'carelink_queue',
  session: 'carelink_session',
  seeded: 'carelink_seeded',
} as const;

// ---- helpers ----

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function get<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- initialization ----

export function initStore(): void {
  if (!isBrowser()) return;
  if (localStorage.getItem(KEYS.seeded)) return;

  const seed = getSeedData();
  set(KEYS.departments, seed.departments);
  set(KEYS.doctors, seed.doctors);
  set(KEYS.admins, seed.admins);
  set(KEYS.patients, seed.patients);
  set(KEYS.appointments, seed.appointments);
  set(KEYS.notifications, seed.notifications);

  // Build initial queue from in_queue appointments
  const queueEntries: QueueEntry[] = seed.appointments
    .filter((a) => a.status === 'in_queue')
    .map((a, i) => {
      const patient = seed.patients.find((p) => p.id === a.patientId);
      return {
        appointmentId: a.id,
        patientId: a.patientId,
        patientName: patient?.fullName ?? 'Unknown',
        doctorId: a.doctorId,
        departmentId: a.departmentId,
        priority: a.priority,
        status: 'waiting' as const,
        checkInTime: a.createdAt,
        estimatedWaitTime: (i + 1) * 15,
        position: i + 1,
      };
    });

  const pq = new PriorityQueue();
  queueEntries.forEach((e) => pq.insert(e));
  set(KEYS.queue, pq.serialise());

  localStorage.setItem(KEYS.seeded, 'true');
}

// ---- Departments ----

export function getDepartments(): Department[] {
  return get<Department[]>(KEYS.departments) ?? [];
}

export function getDepartment(id: string): Department | undefined {
  return getDepartments().find((d) => d.id === id);
}

// ---- Doctors ----

export function getDoctors(): Doctor[] {
  return get<Doctor[]>(KEYS.doctors) ?? [];
}

export function getDoctor(id: string): Doctor | undefined {
  return getDoctors().find((d) => d.id === id);
}

export function getDoctorsByDepartment(departmentId: string): Doctor[] {
  return getDoctors().filter((d) => d.departmentId === departmentId);
}

export function updateDoctor(id: string, updates: Partial<Doctor>): void {
  const docs = getDoctors();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return;
  docs[idx] = { ...docs[idx], ...updates };
  set(KEYS.doctors, docs);
}

// ---- Patients ----

export function getPatients(): Patient[] {
  return get<Patient[]>(KEYS.patients) ?? [];
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function getPatientByUsername(username: string): Patient | undefined {
  return getPatients().find((p) => p.username === username);
}

export function addPatient(patient: Patient): void {
  const list = getPatients();
  list.push(patient);
  set(KEYS.patients, list);
}

export function updatePatient(id: string, updates: Partial<Patient>): void {
  const list = getPatients();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...updates };
  set(KEYS.patients, list);
}

// ---- Admins ----

export function getAdmins(): Admin[] {
  return get<Admin[]>(KEYS.admins) ?? [];
}

export function getAdminByAdminId(adminId: string): Admin | undefined {
  return getAdmins().find((a) => a.adminId === adminId);
}

// ---- Appointments ----

export function getAppointments(): Appointment[] {
  return get<Appointment[]>(KEYS.appointments) ?? [];
}

export function getAppointment(id: string): Appointment | undefined {
  return getAppointments().find((a) => a.id === id);
}

export function getAppointmentsByPatient(patientId: string): Appointment[] {
  return getAppointments().filter((a) => a.patientId === patientId);
}

export function getAppointmentsByDoctor(doctorId: string): Appointment[] {
  return getAppointments().filter((a) => a.doctorId === doctorId);
}

export function getAppointmentsByDepartment(deptId: string): Appointment[] {
  return getAppointments().filter((a) => a.departmentId === deptId);
}

export function addAppointment(appointment: Appointment): void {
  const list = getAppointments();
  list.push(appointment);
  set(KEYS.appointments, list);
}

export function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): void {
  const list = getAppointments();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  set(KEYS.appointments, list);
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): void {
  updateAppointment(id, { status });
}

// ---- Queue ----

export function getQueueEntries(): QueueEntry[] {
  return get<QueueEntry[]>(KEYS.queue) ?? [];
}

export function saveQueue(entries: QueueEntry[]): void {
  set(KEYS.queue, entries);
}

export function loadQueue(): PriorityQueue {
  const pq = new PriorityQueue();
  const entries = getQueueEntries();
  if (entries.length) pq.load(entries);
  return pq;
}

export function addToQueue(entry: QueueEntry): void {
  const pq = loadQueue();
  pq.insert(entry);
  saveQueue(pq.serialise());
}

export function removeFromQueue(appointmentId: string): QueueEntry | null {
  const pq = loadQueue();
  const removed = pq.remove(appointmentId);
  saveQueue(pq.serialise());
  return removed;
}

export function getQueuePosition(appointmentId: string): number | null {
  const sorted = loadQueue().getAll();
  const idx = sorted.findIndex((e) => e.appointmentId === appointmentId);
  return idx === -1 ? null : idx + 1;
}

// ---- Notifications ----

export function getNotifications(patientId?: string): Notification[] {
  const all = get<Notification[]>(KEYS.notifications) ?? [];
  return patientId ? all.filter((n) => n.patientId === patientId) : all;
}

export function addNotification(notification: Notification): void {
  const list = get<Notification[]>(KEYS.notifications) ?? [];
  list.unshift(notification);
  set(KEYS.notifications, list);
}

export function markNotificationRead(id: string): void {
  const list = get<Notification[]>(KEYS.notifications) ?? [];
  const idx = list.findIndex((n) => n.id === id);
  if (idx !== -1) {
    list[idx].read = true;
    set(KEYS.notifications, list);
  }
}

export function getUnreadCount(patientId: string): number {
  return getNotifications(patientId).filter((n) => !n.read).length;
}

// ---- Auth / Session ----

export function setSession(session: AuthSession): void {
  set(KEYS.session, session);
}

export function getSession(): AuthSession | null {
  return get<AuthSession>(KEYS.session);
}

export function clearSession(): void {
  if (isBrowser()) localStorage.removeItem(KEYS.session);
}

export function isLoggedIn(): boolean {
  const s = getSession();
  if (!s) return false;
  return new Date(s.expiresAt) > new Date();
}

// ---- Reset ----

export function resetStore(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
