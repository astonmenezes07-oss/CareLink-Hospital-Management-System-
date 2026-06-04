'use client';

import { useEffect, useState } from 'react';
import { initStore, getSession, getPatient, updatePatient } from '@/lib/store';
import type { Patient } from '@/types';

export default function ProfilePage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', dateOfBirth: '', gender: '', bloodGroup: '', emergencyContact: '' });
  const [medHistory, setMedHistory] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    initStore();
    const s = getSession();
    if (!s) return;
    const p = getPatient(s.userId);
    if (p) {
      setPatient(p);
      setForm({ fullName: p.fullName, email: p.email, phone: p.phone || '', dateOfBirth: p.dateOfBirth || '', gender: p.gender || '', bloodGroup: p.bloodGroup || '', emergencyContact: p.emergencyContact || '' });
      setMedHistory(p.medicalHistory || []);
      setAllergies(p.allergies || []);
    }
  }, []);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!patient) return;
    updatePatient(patient.id, { ...form, medicalHistory: medHistory, allergies, gender: form.gender as Patient['gender'] });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = patient?.fullName?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>

      {/* Avatar & name */}
      <div className="bg-white rounded-2xl border border-border/50 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand flex items-center justify-center text-xl font-bold">{initials}</div>
        <div>
          <p className="text-lg font-semibold text-text-primary">{patient?.fullName}</p>
          <p className="text-sm text-text-muted">{patient?.email}</p>
          <p className="text-xs text-text-muted mt-0.5">@{patient?.username}</p>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1-555-0100' },
            { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-text-secondary mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder || ''}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Gender</label>
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Blood Group</label>
            <select value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all">
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Emergency Contact</label>
          <input type="text" value={form.emergencyContact} onChange={(e) => update('emergencyContact', e.target.value)} placeholder="Name - Phone"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all" />
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Medical History</h3>
        <div className="flex flex-wrap gap-2">
          {medHistory.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand text-xs font-medium">
              {c}
              <button onClick={() => setMedHistory((l) => l.filter((x) => x !== c))} className="hover:text-red-500 ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} placeholder="Add condition..."
            onKeyDown={(e) => { if (e.key === 'Enter' && newCondition.trim()) { setMedHistory((l) => [...l, newCondition.trim()]); setNewCondition(''); } }}
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
          <button onClick={() => { if (newCondition.trim()) { setMedHistory((l) => [...l, newCondition.trim()]); setNewCondition(''); } }}
            className="px-4 py-2 rounded-xl bg-brand-50 text-brand text-xs font-semibold hover:bg-brand-100 transition-all">Add</button>
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Allergies</h3>
        <div className="flex flex-wrap gap-2">
          {allergies.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
              {a}
              <button onClick={() => setAllergies((l) => l.filter((x) => x !== a))} className="hover:text-red-800 ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add allergy..."
            onKeyDown={(e) => { if (e.key === 'Enter' && newAllergy.trim()) { setAllergies((l) => [...l, newAllergy.trim()]); setNewAllergy(''); } }}
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
          <button onClick={() => { if (newAllergy.trim()) { setAllergies((l) => [...l, newAllergy.trim()]); setNewAllergy(''); } }}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all">Add</button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md">
          Save Changes
        </button>
        {saved && <span className="text-sm text-green-600 font-medium animate-fade-in">✓ Profile updated successfully!</span>}
      </div>
    </div>
  );
}
