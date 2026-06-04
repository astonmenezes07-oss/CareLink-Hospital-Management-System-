// ============================================================
// CareLink — Auth Helpers
// ============================================================

import {
  Patient,
  AuthSession,
} from '@/types';
import {
  getPatientByUsername,
  getAdminByAdminId,
  addPatient,
  setSession,
  clearSession,
  getSession,
} from './store';

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Patient auth ----

export interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export function signupPatient(data: SignupData): { ok: true } | { ok: false; error: string } {
  const existing = getPatientByUsername(data.username);
  if (existing) return { ok: false, error: 'Username already exists.' };

  const patient: Patient = {
    id: generateId(),
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    passwordHash: data.password, // in a real app: bcrypt
    createdAt: new Date().toISOString(),
  };

  addPatient(patient);
  return { ok: true };
}

export function loginPatient(
  username: string,
  password: string
): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const patient = getPatientByUsername(username);
  if (!patient) return { ok: false, error: 'Account not found.' };
  if (patient.passwordHash !== password)
    return { ok: false, error: 'Incorrect password.' };

  const session: AuthSession = {
    userId: patient.id,
    role: 'patient',
    username: patient.username,
    name: patient.fullName,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  setSession(session);
  return { ok: true, session };
}

// ---- Admin auth ----

export function loginAdmin(
  adminId: string,
  password: string
): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const admin = getAdminByAdminId(adminId);
  if (!admin) return { ok: false, error: 'Admin ID not found.' };
  if (admin.passwordHash !== password)
    return { ok: false, error: 'Incorrect password.' };

  const session: AuthSession = {
    userId: admin.id,
    role: 'admin',
    username: admin.adminId,
    name: admin.name,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
  setSession(session);
  return { ok: true, session };
}

// ---- Google OAuth (simulated) ----

export function simulateGoogleAuth(): {
  ok: true;
  session: AuthSession;
} {
  // Simulate a Google-authenticated user
  const patient: Patient = {
    id: generateId(),
    fullName: 'Google User',
    username: `guser_${Date.now().toString(36)}`,
    email: 'googleuser@gmail.com',
    passwordHash: '',
    createdAt: new Date().toISOString(),
  };

  addPatient(patient);

  const session: AuthSession = {
    userId: patient.id,
    role: 'patient',
    username: patient.username,
    name: patient.fullName,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  setSession(session);
  return { ok: true, session };
}

// ---- Session management ----

export function logout(): void {
  clearSession();
}

export function getCurrentSession(): AuthSession | null {
  return getSession();
}

export function requireAuth(role?: 'patient' | 'admin'): AuthSession | null {
  const session = getSession();
  if (!session) return null;
  if (new Date(session.expiresAt) <= new Date()) {
    clearSession();
    return null;
  }
  if (role && session.role !== role) return null;
  return session;
}
