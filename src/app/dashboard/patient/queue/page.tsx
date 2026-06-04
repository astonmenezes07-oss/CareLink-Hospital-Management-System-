'use client';

import { useEffect, useState } from 'react';
import { initStore, getSession, loadQueue, getDoctor, getDepartment } from '@/lib/store';
import type { QueueEntry } from '@/types';

export default function QueueTracking() {
  const [myEntry, setMyEntry] = useState<QueueEntry | null>(null);
  const [totalInQueue, setTotalInQueue] = useState(0);

  const load = () => {
    initStore();
    const s = getSession();
    if (!s) return;
    const pq = loadQueue();
    const all = pq.getAll();
    setTotalInQueue(all.filter((e) => e.status === 'waiting').length);
    const entry = all.find((e) => e.patientId === s.userId && e.status === 'waiting');
    setMyEntry(entry || null);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const doctor = myEntry ? getDoctor(myEntry.doctorId) : null;
  const dept = myEntry ? getDepartment(myEntry.departmentId) : null;

  const priorityColor = myEntry?.priority.level === 'high' ? 'text-priority-high' : myEntry?.priority.level === 'medium' ? 'text-priority-medium' : 'text-priority-low';
  const priorityBg = myEntry?.priority.level === 'high' ? 'bg-priority-high-bg border-priority-high/20' : myEntry?.priority.level === 'medium' ? 'bg-priority-medium-bg border-priority-medium/20' : 'bg-priority-low-bg border-priority-low/20';

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Queue Status</h1>

      {!myEntry ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <p className="text-4xl mb-4">🏥</p>
          <p className="text-lg font-semibold text-text-primary">Not Currently in Queue</p>
          <p className="text-sm text-text-muted mt-2">Book an appointment to join the queue.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Position card */}
          <div className="bg-white rounded-2xl border border-border/50 p-8 text-center">
            <p className="text-sm text-text-muted font-medium mb-3">Your Queue Position</p>
            <div className="w-28 h-28 rounded-full border-4 border-brand mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-brand">#{myEntry.position}</span>
            </div>
            <p className="text-sm text-text-secondary">
              out of <span className="font-semibold">{totalInQueue}</span> patients waiting
            </p>

            {/* Progress bar */}
            <div className="mt-5 max-w-xs mx-auto">
              <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, ((totalInQueue - myEntry.position + 1) / totalInQueue) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-text-muted">
                <span>Waiting</span>
                <span>Your Turn</span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-border/50 p-5 text-center">
              <p className="text-xs text-text-muted font-medium">Estimated Wait</p>
              <p className="text-2xl font-bold text-brand mt-1">{myEntry.estimatedWaitTime} min</p>
            </div>
            <div className={`rounded-2xl border p-5 text-center ${priorityBg}`}>
              <p className="text-xs text-text-muted font-medium">Priority Level</p>
              <p className={`text-2xl font-bold mt-1 ${priorityColor}`}>
                {myEntry.priority.level.charAt(0).toUpperCase() + myEntry.priority.level.slice(1)}
              </p>
              <p className="text-xs text-text-muted mt-0.5">Score: {myEntry.priority.total}/100</p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 p-5 text-center">
              <p className="text-xs text-text-muted font-medium">Check-in Time</p>
              <p className="text-lg font-bold text-text-primary mt-1">
                {new Date(myEntry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Doctor/Department */}
          <div className="bg-white rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand flex items-center justify-center text-sm font-bold">
                {doctor?.avatar || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{doctor?.name || 'Assigned Doctor'}</p>
                <p className="text-xs text-text-muted">{dept?.icon} {dept?.name} • {doctor?.specialization}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-muted text-center">Auto-refreshes every 30 seconds</p>
        </div>
      )}
    </div>
  );
}
