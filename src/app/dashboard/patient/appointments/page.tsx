'use client';

import { useEffect, useState } from 'react';
import { initStore, getSession, getAppointmentsByPatient, getDoctor, getDepartment, updateAppointmentStatus } from '@/lib/store';
import type { Appointment } from '@/types';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    initStore();
    load();
  }, []);

  const load = () => {
    const s = getSession();
    if (!s) return;
    setAppointments(getAppointmentsByPatient(s.userId));
  };

  const upcoming = appointments.filter((a) => ['pending', 'confirmed', 'in_queue', 'in_progress'].includes(a.status));
  const history = appointments.filter((a) => ['completed', 'cancelled'].includes(a.status));
  const list = tab === 'upcoming' ? upcoming : history;

  const cancel = (id: string) => {
    updateAppointmentStatus(id, 'cancelled');
    load();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-blue-50 text-blue-600', confirmed: 'bg-teal-50 text-teal-600',
      in_queue: 'bg-amber-50 text-amber-600', in_progress: 'bg-orange-50 text-orange-600',
      completed: 'bg-green-50 text-green-600', cancelled: 'bg-gray-100 text-gray-500',
    };
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[status] || ''}`}>{status.replace('_', ' ')}</span>;
  };

  const priorityBadge = (level: string) => {
    const cls = level === 'high' ? 'bg-priority-high-bg text-priority-high' : level === 'medium' ? 'bg-priority-medium-bg text-priority-medium' : 'bg-priority-low-bg text-priority-low';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{level}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">My Appointments</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-secondary rounded-xl p-1 w-fit">
        {(['upcoming', 'history'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
            {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm text-text-muted">{tab === 'upcoming' ? 'No upcoming appointments.' : 'No appointment history.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((apt) => {
            const doc = getDoctor(apt.doctorId);
            const dept = getDepartment(apt.departmentId);
            return (
              <div key={apt.id} className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs text-brand font-medium">{new Date(apt.date).toLocaleString('en', { month: 'short' })}</span>
                      <span className="text-sm text-brand font-bold leading-none">{apt.date.slice(8, 10)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{doc?.name || 'Doctor'}</p>
                      <p className="text-xs text-text-muted">{dept?.icon} {dept?.name} • {apt.timeSlot}</p>
                      <p className="text-xs text-text-secondary mt-1">{apt.symptoms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <div className="flex gap-1.5">
                      {statusBadge(apt.status)}
                      {priorityBadge(apt.priority.level)}
                    </div>
                    {apt.queuePosition && <p className="text-xs text-text-muted">Queue: #{apt.queuePosition}</p>}
                    {['pending', 'confirmed'].includes(apt.status) && (
                      <button onClick={() => cancel(apt.id)} className="text-xs text-red-500 hover:text-red-700 font-medium mt-1">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
