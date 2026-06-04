// ============================================================
// CareLink — Queue Manager  (high-level queue operations)
// ============================================================

import {
  Appointment,
  QueueEntry,
  Notification,
} from '@/types';
import { PriorityQueue } from './priority-queue';
import {
  loadQueue,
  saveQueue,
  getAppointment,
  updateAppointment,
  getPatient,
  getDoctor,
  getDepartment,
  addNotification,
} from './store';
import { analyzeSymptoms } from './symptom-analyzer';

function uid(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Admit an appointment into the live queue. */
export function admitToQueue(appointmentId: string): QueueEntry | null {
  const apt = getAppointment(appointmentId);
  if (!apt) return null;

  const patient = getPatient(apt.patientId);
  const pq = loadQueue();

  const entry: QueueEntry = {
    appointmentId: apt.id,
    patientId: apt.patientId,
    patientName: patient?.fullName ?? 'Unknown',
    doctorId: apt.doctorId,
    departmentId: apt.departmentId,
    priority: apt.priority,
    status: 'waiting',
    checkInTime: new Date().toISOString(),
    estimatedWaitTime: pq.estimateWaitTime(pq.size + 1),
    position: pq.size + 1,
  };

  pq.insert(entry);
  saveQueue(pq.serialise());
  updateAppointment(appointmentId, { status: 'in_queue' });

  // Notify patient
  const notif: Notification = {
    id: uid(),
    patientId: apt.patientId,
    type: 'queue_update',
    title: 'Added to Queue',
    message: `You have been added to the queue. Your position is #${entry.position}.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  addNotification(notif);

  return entry;
}

/** Mark a queue entry as in-progress (doctor is seeing the patient). */
export function startTreatment(appointmentId: string): boolean {
  const pq = loadQueue();
  const all = pq.getAll();
  const entry = all.find((e) => e.appointmentId === appointmentId);
  if (!entry) return false;

  entry.status = 'in_progress';
  saveQueue(pq.serialise());
  updateAppointment(appointmentId, { status: 'in_progress' });

  addNotification({
    id: uid(),
    patientId: entry.patientId,
    type: 'queue_update',
    title: 'Your Turn',
    message: 'The doctor is ready to see you now. Please proceed to the consultation room.',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return true;
}

/** Mark treatment as complete — remove from queue. */
export function completeTreatment(appointmentId: string): boolean {
  const pq = loadQueue();
  const removed = pq.remove(appointmentId);
  if (!removed) return false;

  saveQueue(pq.serialise());
  updateAppointment(appointmentId, { status: 'completed' });

  addNotification({
    id: uid(),
    patientId: removed.patientId,
    type: 'treatment_complete',
    title: 'Treatment Complete',
    message: 'Your treatment has been completed. Thank you for visiting CareLink.',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return true;
}

/** Admin changes a patient's priority manually. */
export function changePriority(
  appointmentId: string,
  newScore: number,
  newLevel: 'high' | 'medium' | 'low'
): boolean {
  const pq = loadQueue();
  const ok = pq.updatePriority(appointmentId, newScore, newLevel);
  if (!ok) return false;

  saveQueue(pq.serialise());

  // Update the appointment record too
  const apt = getAppointment(appointmentId);
  if (apt) {
    updateAppointment(appointmentId, {
      priority: { ...apt.priority, total: newScore, level: newLevel },
    });

    addNotification({
      id: uid(),
      patientId: apt.patientId,
      type: 'priority_changed',
      title: 'Priority Updated',
      message: `Your priority has been updated to ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)} (score: ${newScore}).`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return true;
}

/** Recalculate priorities for ALL patients in the queue based on latest data. */
export function rebalanceQueue(): void {
  const pq = loadQueue();
  const all = pq.serialise();

  for (const entry of all) {
    const apt = getAppointment(entry.appointmentId);
    if (!apt) continue;

    const patient = getPatient(apt.patientId);
    const age = patient?.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(patient.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : undefined;

    const newPriority = analyzeSymptoms(
      apt.symptoms,
      age,
      apt.vitalSigns,
      apt.existingConditions
    );
    entry.priority = newPriority;
  }

  pq.load(all);
  saveQueue(pq.serialise());
}

/** Get high-level queue statistics. */
export function getQueueStats() {
  const pq = loadQueue();
  const all = pq.getAll();

  const waiting = all.filter((e) => e.status === 'waiting');
  const totalWait = waiting.reduce((s, e) => s + e.estimatedWaitTime, 0);

  return {
    totalInQueue: all.length,
    highPriority: all.filter((e) => e.priority.level === 'high').length,
    mediumPriority: all.filter((e) => e.priority.level === 'medium').length,
    lowPriority: all.filter((e) => e.priority.level === 'low').length,
    averageWaitTime: waiting.length
      ? Math.round(totalWait / waiting.length)
      : 0,
    patientsServedToday: all.filter((e) => e.status === 'completed').length,
    emergencyCount: all.filter(
      (e) => e.priority.level === 'high' && e.status === 'waiting'
    ).length,
  };
}
