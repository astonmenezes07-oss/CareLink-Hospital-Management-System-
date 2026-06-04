'use client';

import { useEffect, useState } from 'react';
import { initStore, getAppointments, loadQueue, getDepartments, getDepartment } from '@/lib/store';
import type { Appointment, Department } from '@/types';

export default function AdminAnalytics() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [queueData, setQueueData] = useState({ high: 0, medium: 0, low: 0, total: 0 });

  useEffect(() => {
    initStore();
    const apts = getAppointments();
    setAppointments(apts);
    setDepartments(getDepartments());
    const pq = loadQueue();
    const all = pq.getAll();
    setQueueData({
      high: all.filter((e) => e.priority.level === 'high').length,
      medium: all.filter((e) => e.priority.level === 'medium').length,
      low: all.filter((e) => e.priority.level === 'low').length,
      total: all.length,
    });
  }, []);

  // Priority distribution
  const totalApts = appointments.length || 1;
  const highCount = appointments.filter((a) => a.priority.level === 'high').length;
  const medCount = appointments.filter((a) => a.priority.level === 'medium').length;
  const lowCount = appointments.filter((a) => a.priority.level === 'low').length;

  // Status distribution
  const statusCounts: Record<string, number> = {};
  appointments.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
  const statusColors: Record<string, string> = {
    pending: 'bg-blue-400', confirmed: 'bg-teal-400', in_queue: 'bg-amber-400',
    in_progress: 'bg-orange-400', completed: 'bg-green-400', cancelled: 'bg-gray-400',
  };

  // Department load
  const deptLoad = departments.map((d) => ({
    ...d,
    count: appointments.filter((a) => a.departmentId === d.id).length,
  })).sort((a, b) => b.count - a.count);
  const maxDeptCount = Math.max(...deptLoad.map((d) => d.count), 1);

  // Average wait by priority
  const avgWait = (level: string) => {
    const matching = appointments.filter((a) => a.priority.level === level && a.estimatedWaitTime);
    if (!matching.length) return 0;
    return Math.round(matching.reduce((s, a) => s + (a.estimatedWaitTime || 0), 0) / matching.length);
  };

  const served = appointments.filter((a) => a.status === 'completed').length;
  const waiting = queueData.total;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Analytics & Reports</h1>

      {/* Queue Throughput */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border/50 p-5 text-center">
          <p className="text-xs text-text-muted font-medium">Total Appointments</p>
          <p className="text-3xl font-bold text-brand mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border/50 p-5 text-center">
          <p className="text-xs text-text-muted font-medium">Patients Served</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{served}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border/50 p-5 text-center">
          <p className="text-xs text-text-muted font-medium">Currently Waiting</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{waiting}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-2xl border border-border/50 p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-5">Priority Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'High Priority', count: highCount, color: 'bg-priority-high', textColor: 'text-priority-high' },
              { label: 'Medium Priority', count: medCount, color: 'bg-priority-medium', textColor: 'text-priority-medium' },
              { label: 'Low Priority', count: lowCount, color: 'bg-priority-low', textColor: 'text-priority-low' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-medium">{item.label}</span>
                  <span className={`font-bold ${item.textColor}`}>{item.count} ({Math.round((item.count / totalApts) * 100)}%)</span>
                </div>
                <div className="h-3 bg-surface-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${(item.count / totalApts) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Load */}
        <div className="bg-white rounded-2xl border border-border/50 p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-5">Department Load</h3>
          <div className="space-y-3">
            {deptLoad.map((d) => (
              <div key={d.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary">{d.icon} {d.name}</span>
                  <span className="text-text-primary font-semibold">{d.count}</span>
                </div>
                <div className="h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand transition-all duration-700"
                    style={{ width: `${(d.count / maxDeptCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Wait Time by Priority */}
        <div className="bg-white rounded-2xl border border-border/50 p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-5">Average Wait Time by Priority</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'High', time: avgWait('high'), color: 'bg-priority-high-bg text-priority-high border-priority-high/20' },
              { label: 'Medium', time: avgWait('medium'), color: 'bg-priority-medium-bg text-priority-medium border-priority-medium/20' },
              { label: 'Low', time: avgWait('low'), color: 'bg-priority-low-bg text-priority-low border-priority-low/20' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 text-center ${item.color}`}>
                <p className="text-2xl font-bold">{item.time}m</p>
                <p className="text-xs font-medium mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-border/50 p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-5">Status Distribution</h3>
          {/* Stacked bar */}
          <div className="h-6 rounded-full overflow-hidden flex mb-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className={`${statusColors[status] || 'bg-gray-300'} transition-all duration-500`}
                style={{ width: `${(count / totalApts) * 100}%` }}
                title={`${status}: ${count}`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-gray-300'}`} />
                <span className="text-text-secondary capitalize">{status.replace('_', ' ')}</span>
                <span className="text-text-muted">({count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
