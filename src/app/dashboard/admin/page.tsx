'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initStore, getAppointments, loadQueue, getDepartments, getDoctors, getPatients, getPatient, getDepartment, getDoctor } from '@/lib/store';
import type { QueueEntry, Appointment } from '@/types';

export default function AdminOverview() {
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ patients: 0, inQueue: 0, emergency: 0, avgWait: 0, doctors: 0 });

  useEffect(() => {
    initStore();
    const pq = loadQueue();
    const all = pq.getAll();
    setQueueEntries(all);
    const apts = getAppointments();
    setAppointments(apts);
    const docs = getDoctors();
    const waiting = all.filter((e) => e.status === 'waiting');
    setStats({
      patients: getPatients().length,
      inQueue: waiting.length,
      emergency: all.filter((e) => e.priority.level === 'high' && e.status === 'waiting').length,
      avgWait: waiting.length ? Math.round(waiting.reduce((s, e) => s + e.estimatedWaitTime, 0) / waiting.length) : 0,
      doctors: docs.filter((d) => d.currentPatients < d.maxPatients).length,
    });
  }, []);

  const priorityBadge = (level: string) => {
    const cls = level === 'high' ? 'bg-priority-high-bg text-priority-high' : level === 'medium' ? 'bg-priority-medium-bg text-priority-medium' : 'bg-priority-low-bg text-priority-low';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{level}</span>;
  };

  const emergencies = queueEntries.filter((e) => e.priority.level === 'high' && e.status === 'waiting');
  const topQueue = queueEntries.filter((e) => e.status === 'waiting').slice(0, 5);
  const recentApts = appointments.slice(-5).reverse();
  const departments = getDepartments();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {[
          { label: 'Total Patients', value: stats.patients, icon: '👥', color: 'text-brand' },
          { label: 'In Queue', value: stats.inQueue, icon: '📊', color: 'text-amber-600' },
          { label: 'Emergency', value: stats.emergency, icon: '🚨', color: 'text-priority-high' },
          { label: 'Avg Wait', value: `${stats.avgWait}m`, icon: '⏱️', color: 'text-blue-600' },
          { label: 'Doctors Available', value: stats.doctors, icon: '🩺', color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border/50 p-4">
            <span className="text-lg">{s.icon}</span>
            <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emergency Alerts */}
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-priority-high animate-pulse-soft" />
            <h3 className="text-sm font-semibold text-text-primary">Emergency Alerts</h3>
          </div>
          {emergencies.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-muted">No emergency cases currently.</div>
          ) : (
            <div className="divide-y divide-border/30">
              {emergencies.map((e) => (
                <div key={e.appointmentId} className="px-5 py-3 bg-priority-high-bg/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{e.patientName}</p>
                      <p className="text-xs text-text-muted">{getDepartment(e.departmentId)?.name} • Score: {e.priority.total}</p>
                    </div>
                    {priorityBadge('high')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Queue Preview */}
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Live Queue</h3>
            <Link href="/dashboard/admin/queue" className="text-xs text-brand font-medium hover:underline">View All</Link>
          </div>
          {topQueue.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-muted">Queue is empty.</div>
          ) : (
            <div className="divide-y divide-border/30">
              {topQueue.map((e) => (
                <div key={e.appointmentId} className="flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-secondary flex items-center justify-center text-xs font-bold text-text-muted">#{e.position}</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{e.patientName}</p>
                      <p className="text-xs text-text-muted">{getDepartment(e.departmentId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {priorityBadge(e.priority.level)}
                    <span className="text-xs text-text-muted">{e.estimatedWaitTime}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Utilization */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-text-primary">Department Overview</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {departments.map((dept) => {
            const deptApts = appointments.filter((a) => a.departmentId === dept.id);
            const inQueue = queueEntries.filter((e) => e.departmentId === dept.id && e.status === 'waiting').length;
            return (
              <div key={dept.id} className="p-4 rounded-xl bg-surface-secondary border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <span>{dept.icon}</span>
                  <span className="text-sm font-semibold text-text-primary">{dept.name}</span>
                </div>
                <div className="flex gap-4 text-xs text-text-muted">
                  <span>{deptApts.length} appointments</span>
                  <span>{inQueue} in queue</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
