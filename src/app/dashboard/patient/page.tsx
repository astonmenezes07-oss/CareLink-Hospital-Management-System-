'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initStore, getSession, getPatient, getAppointmentsByPatient, loadQueue, getNotifications } from '@/lib/store';
import type { Appointment, Patient } from '@/types';

export default function PatientOverview() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queuePos, setQueuePos] = useState<number | null>(null);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [currentPriority, setCurrentPriority] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    initStore();
    const s = getSession();
    if (!s) return;
    const p = getPatient(s.userId);
    setPatient(p ?? null);

    const apts = getAppointmentsByPatient(s.userId);
    setAppointments(apts);

    const pq = loadQueue();
    const all = pq.getAll();
    const myEntry = all.find((e) => e.patientId === s.userId && e.status === 'waiting');
    if (myEntry) {
      setQueuePos(myEntry.position);
      setWaitTime(myEntry.estimatedWaitTime);
      setCurrentPriority(myEntry.priority.level);
    }

    setUnread(getNotifications(s.userId).filter((n) => !n.read).length);
  }, []);

  const upcoming = appointments.filter((a) => ['pending', 'confirmed', 'in_queue'].includes(a.status));
  const recent = appointments.slice(-3).reverse();

  const stats = [
    { label: 'Upcoming', value: upcoming.length, color: 'text-brand', bg: 'bg-brand-50', icon: '📅' },
    { label: 'Queue Position', value: queuePos ? `#${queuePos}` : '—', color: 'text-amber-600', bg: 'bg-amber-50', icon: '📊' },
    { label: 'Est. Wait', value: queuePos ? `${waitTime} min` : '—', color: 'text-blue-600', bg: 'bg-blue-50', icon: '⏱️' },
    { label: 'Priority', value: currentPriority ? currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1) : '—', color: currentPriority === 'high' ? 'text-priority-high' : currentPriority === 'medium' ? 'text-priority-medium' : 'text-priority-low', bg: currentPriority === 'high' ? 'bg-priority-high-bg' : currentPriority === 'medium' ? 'bg-priority-medium-bg' : 'bg-priority-low-bg', icon: '🏥' },
  ];

  const priorityBadge = (level: string) => {
    const cls = level === 'high' ? 'bg-priority-high-bg text-priority-high' : level === 'medium' ? 'bg-priority-medium-bg text-priority-medium' : 'bg-priority-low-bg text-priority-low';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-blue-50 text-blue-600',
      confirmed: 'bg-teal-50 text-teal-600',
      in_queue: 'bg-amber-50 text-amber-600',
      in_progress: 'bg-orange-50 text-orange-600',
      completed: 'bg-green-50 text-green-600',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] || ''}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {patient?.fullName?.split(' ')[0] || 'Patient'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">Here&apos;s your health dashboard overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-border/30`}>
            <p className="text-xs text-text-secondary font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <span className="text-lg mt-1 block">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/dashboard/patient/book" className="flex items-center gap-3 p-4 rounded-xl bg-brand text-white hover:bg-brand-dark transition-all duration-200 shadow-sm">
          <span className="text-xl">📅</span>
          <div>
            <p className="text-sm font-semibold">Book Appointment</p>
            <p className="text-xs text-white/70">Schedule a new visit</p>
          </div>
        </Link>
        <Link href="/dashboard/patient/queue" className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border hover:border-brand/30 hover:shadow-sm transition-all duration-200">
          <span className="text-xl">📊</span>
          <div>
            <p className="text-sm font-semibold text-text-primary">View Queue</p>
            <p className="text-xs text-text-muted">Check your position</p>
          </div>
        </Link>
        <Link href="/dashboard/patient/notifications" className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border hover:border-brand/30 hover:shadow-sm transition-all duration-200">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-sm font-semibold text-text-primary">Notifications</p>
            <p className="text-xs text-text-muted">{unread} unread</p>
          </div>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-text-primary">Recent Appointments</h3>
          <Link href="/dashboard/patient/appointments" className="text-xs text-brand font-medium hover:underline">View All</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No appointments yet. Book your first appointment to get started.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {recent.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand text-sm font-bold flex-shrink-0">
                    {apt.date.slice(8, 10)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{apt.symptoms.slice(0, 40)}{apt.symptoms.length > 40 ? '...' : ''}</p>
                    <p className="text-xs text-text-muted">{apt.timeSlot} • {apt.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {priorityBadge(apt.priority.level)}
                  {statusBadge(apt.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
