'use client';

import { useEffect, useState } from 'react';
import { initStore, getDoctors, getDepartments, getDepartment } from '@/lib/store';
import type { Doctor, Department } from '@/types';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    initStore();
    setDoctors(getDoctors());
    setDepartments(getDepartments());
  }, []);

  const filtered = deptFilter ? doctors.filter((d) => d.departmentId === deptFilter) : doctors;

  const statusColor = (doc: Doctor) => {
    const ratio = doc.currentPatients / doc.maxPatients;
    if (ratio >= 1) return { bg: 'bg-priority-high-bg', text: 'text-priority-high', label: 'Full', bar: 'bg-priority-high' };
    if (ratio >= 0.7) return { bg: 'bg-priority-medium-bg', text: 'text-priority-medium', label: 'Busy', bar: 'bg-priority-medium' };
    return { bg: 'bg-priority-low-bg', text: 'text-priority-low', label: 'Available', bar: 'bg-priority-low' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Doctor Monitoring</h1>

      <div className="flex gap-3">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const dept = getDepartment(doc.departmentId);
          const status = statusColor(doc);
          const expanded = expandedId === doc.id;
          const ratio = doc.currentPatients / doc.maxPatients;

          return (
            <div key={doc.id}
              onClick={() => setExpandedId(expanded ? null : doc.id)}
              className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand flex items-center justify-center text-sm font-bold">
                    {doc.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{doc.name}</p>
                    <p className="text-xs text-text-muted">{doc.specialization}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                  <span>Patient Load</span>
                  <span>{doc.currentPatients}/{doc.maxPatients}</span>
                </div>
                <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                </div>
              </div>

              <p className="text-xs text-text-muted mt-3">{dept?.icon} {dept?.name}</p>

              {expanded && (
                <div className="mt-4 pt-4 border-t border-border/30 space-y-2 animate-fade-in">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Qualification</span>
                    <span className="text-text-primary font-medium">{doc.qualification}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Experience</span>
                    <span className="text-text-primary font-medium">{doc.experience} years</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Department</span>
                    <span className="text-text-primary font-medium">{dept?.name}</span>
                  </div>
                  <div className="text-xs text-text-muted mt-2">
                    <p className="font-medium text-text-primary mb-1">Schedule</p>
                    <p>Mon-Fri: 09:00 - 17:00</p>
                    <p>Saturday: 09:00 - 13:00</p>
                    <p>Sunday: Off</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
