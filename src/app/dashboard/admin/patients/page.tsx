'use client';

import { useEffect, useState } from 'react';
import { initStore, getPatients, getAppointmentsByPatient } from '@/lib/store';
import type { Patient } from '@/types';

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [bgFilter, setBgFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    initStore();
    setPatients(getPatients());
  }, []);

  const filtered = patients.filter((p) => {
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (bgFilter && p.bloodGroup !== bgFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Patient Records</h1>

      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
        <select value={bgFilter} onChange={(e) => setBgFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all">
          <option value="">All Blood Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-text-muted">No patients found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const expanded = expandedId === p.id;
            const apts = getAppointmentsByPatient(p.id);
            const initials = p.fullName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

            return (
              <div key={p.id}
                onClick={() => setExpandedId(expanded ? null : p.id)}
                className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand flex items-center justify-center text-sm font-bold">{initials}</div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{p.fullName}</p>
                      <p className="text-xs text-text-muted">{p.email} {p.phone ? `• ${p.phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.bloodGroup && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold">{p.bloodGroup}</span>
                    )}
                    <span className="text-xs text-text-muted">{apts.length} apt{apts.length !== 1 ? 's' : ''}</span>
                    <svg className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Medical History Tags */}
                {p.medicalHistory && p.medicalHistory.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.medicalHistory.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded-full bg-brand-50 text-brand text-[10px] font-medium">{h}</span>
                    ))}
                  </div>
                )}

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-border/30 grid sm:grid-cols-2 gap-3 text-xs animate-fade-in">
                    <div>
                      <span className="text-text-muted">Username:</span>
                      <span className="text-text-primary font-medium ml-2">@{p.username}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Gender:</span>
                      <span className="text-text-primary font-medium ml-2">{p.gender || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Date of Birth:</span>
                      <span className="text-text-primary font-medium ml-2">{p.dateOfBirth || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Blood Group:</span>
                      <span className="text-text-primary font-medium ml-2">{p.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Emergency Contact:</span>
                      <span className="text-text-primary font-medium ml-2">{p.emergencyContact || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Registered:</span>
                      <span className="text-text-primary font-medium ml-2">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    {p.allergies && p.allergies.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-text-muted">Allergies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.allergies.map((a) => (
                            <span key={a} className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-medium">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
