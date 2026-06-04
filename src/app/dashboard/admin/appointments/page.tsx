'use client';

import { useEffect, useState } from 'react';
import { initStore, getAppointments, getPatient, getDoctor, getDepartment, getDepartments, updateAppointmentStatus, addToQueue } from '@/lib/store';
import type { Appointment, Department } from '@/types';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    initStore();
    load();
    setDepartments(getDepartments());
  }, []);

  const load = () => setAppointments(getAppointments());

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = appointments
    .filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (deptFilter && a.departmentId !== deptFilter) return false;
      if (search) {
        const p = getPatient(a.patientId);
        if (!p?.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'priority') return (b.priority.total - a.priority.total) * dir;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * dir;
      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * dir;
    });

  const confirm = (id: string) => { updateAppointmentStatus(id, 'confirmed'); load(); };
  const cancel = (id: string) => { updateAppointmentStatus(id, 'cancelled'); load(); };
  const moveToQueue = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'in_queue');
    const p = getPatient(apt.patientId);
    addToQueue({
      appointmentId: apt.id, patientId: apt.patientId, patientName: p?.fullName || 'Unknown',
      doctorId: apt.doctorId, departmentId: apt.departmentId, priority: apt.priority,
      status: 'waiting', checkInTime: new Date().toISOString(), estimatedWaitTime: 15, position: 0,
    });
    load();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-blue-50 text-blue-600', confirmed: 'bg-teal-50 text-teal-600',
      in_queue: 'bg-amber-50 text-amber-600', in_progress: 'bg-orange-50 text-orange-600',
      completed: 'bg-green-50 text-green-600', cancelled: 'bg-gray-100 text-gray-500',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] || ''}`}>{status.replace('_', ' ')}</span>;
  };

  const priorityBadge = (level: string) => {
    const cls = level === 'high' ? 'bg-priority-high-bg text-priority-high' : level === 'medium' ? 'bg-priority-medium-bg text-priority-medium' : 'bg-priority-low-bg text-priority-low';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{level}</span>;
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-1 text-[10px]">{sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..."
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm w-52 focus:outline-none focus:ring-2 focus:ring-brand/30" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">All Status</option>
          {['pending', 'confirmed', 'in_queue', 'in_progress', 'completed', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Doctor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary" onClick={() => toggleSort('date')}>
                  Date <SortIcon col="date" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Symptoms</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary" onClick={() => toggleSort('priority')}>
                  Priority <SortIcon col="priority" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary" onClick={() => toggleSort('status')}>
                  Status <SortIcon col="status" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((apt) => {
                const patient = getPatient(apt.patientId);
                const doc = getDoctor(apt.doctorId);
                const dept = getDepartment(apt.departmentId);
                return (
                  <tr key={apt.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{patient?.fullName || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text-secondary">{doc?.name}</p>
                      <p className="text-xs text-text-muted">{dept?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <p>{apt.date}</p>
                      <p className="text-xs text-text-muted">{apt.timeSlot}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{apt.symptoms}</td>
                    <td className="px-4 py-3">{priorityBadge(apt.priority.level)}</td>
                    <td className="px-4 py-3">{statusBadge(apt.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {apt.status === 'pending' && (
                          <button onClick={() => confirm(apt.id)} className="px-2 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100">Confirm</button>
                        )}
                        {['pending', 'confirmed'].includes(apt.status) && (
                          <button onClick={() => moveToQueue(apt)} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100">To Queue</button>
                        )}
                        {!['completed', 'cancelled'].includes(apt.status) && (
                          <button onClick={() => cancel(apt.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-text-muted">No appointments found.</div>
        )}
      </div>
    </div>
  );
}
