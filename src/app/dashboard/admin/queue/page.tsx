'use client';

import { useEffect, useState, useCallback } from 'react';
import { initStore, loadQueue, saveQueue, getAppointment, updateAppointment, getDepartment, getDoctor, getDepartments, getDoctorsByDepartment, addAppointment, addToQueue, addNotification, getPatients } from '@/lib/store';
import { analyzeSymptoms } from '@/lib/symptom-analyzer';
import type { QueueEntry, Department, Doctor, Patient } from '@/types';

const CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Cancer', 'Kidney Disease', 'Pregnancy'];

export default function QueueManagement() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState(50);
  const [editLevel, setEditLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [now, setNow] = useState(Date.now());
  const [toastMessage, setToastMessage] = useState('');

  // --- Add Emergency Patient State ---
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addForm, setAddForm] = useState({
    patientName: '',
    departmentId: '',
    doctorId: '',
    symptoms: '',
    conditions: [] as string[],
    notes: '',
  });
  const [addDoctors, setAddDoctors] = useState<Doctor[]>([]);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  const load = useCallback(() => {
    initStore();
    const pq = loadQueue();
    setEntries(pq.getAll());
    setDepartments(getDepartments());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [load]);

  // Update doctors list when department changes in add form
  useEffect(() => {
    if (addForm.departmentId) {
      setAddDoctors(getDoctorsByDepartment(addForm.departmentId));
      setAddForm(prev => ({ ...prev, doctorId: '' }));
    } else {
      setAddDoctors([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addForm.departmentId]);

  const filtered = entries.filter((e) => {
    if (e.status !== 'waiting' && e.status !== 'in_progress') return false;
    if (filter !== 'all' && e.priority.level !== filter) return false;
    if (deptFilter && e.departmentId !== deptFilter) return false;
    if (search && !e.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const waitingList = filtered.filter(e => e.status === 'waiting');
  const inProgressList = filtered.filter(e => e.status === 'in_progress');

  const handlePriorityChange = (appointmentId: string) => {
    const pq = loadQueue();
    pq.updatePriority(appointmentId, editScore, editLevel);
    saveQueue(pq.serialise());
    const apt = getAppointment(appointmentId);
    if (apt) updateAppointment(appointmentId, { priority: { ...apt.priority, total: editScore, level: editLevel } });
    setEditingId(null);
    load();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const markInProgress = (appointmentId: string) => {
    showToast("The Patient is being treated");
    updateAppointment(appointmentId, { status: 'in_progress' });
    const pq = loadQueue();
    const all = pq.serialise();
    const idx = all.findIndex((e) => e.appointmentId === appointmentId);
    if (idx !== -1) { all[idx].status = 'in_progress'; }
    const newPq = loadQueue();
    newPq.load(all);
    saveQueue(newPq.serialise());
    load();
  };

  const markComplete = (appointmentId: string) => {
    showToast("The patient's treatment is completed");
    updateAppointment(appointmentId, { status: 'completed' });
    const pq = loadQueue();
    pq.remove(appointmentId);
    saveQueue(pq.serialise());
    load();
  };

  const removeEntry = (appointmentId: string) => {
    showToast("The patient is removed from the queue");
    const pq = loadQueue();
    pq.remove(appointmentId);
    saveQueue(pq.serialise());
    load();
  };

  const rebalance = () => {
    const pq = loadQueue();
    pq.rebalance();
    saveQueue(pq.serialise());
    load();
  };

  // --- Add Emergency Patient ---
  const handleAddPatient = () => {
    if (!addForm.patientName.trim() || !addForm.departmentId || !addForm.doctorId || !addForm.symptoms.trim()) return;

    setAddSubmitting(true);

    const priority = analyzeSymptoms(
      addForm.symptoms,
      undefined,
      undefined,
      addForm.conditions.length ? addForm.conditions : undefined
    );

    if (priority.level !== 'high') {
      priority.level = 'high';
      priority.total = Math.max(priority.total, 75);
      priority.emergencyBonus = Math.max(priority.emergencyBonus, 20);
      priority.reasoning = 'Emergency patient added by hospital admin. ' + priority.reasoning;
      priority.recommendedAction = 'Immediate attention required — added via admin emergency intake.';
    }

    const id = `apt-emg-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const doctor = getDoctor(addForm.doctorId);

    addAppointment({
      id,
      patientId: `walk-in-${Date.now()}`,
      doctorId: addForm.doctorId,
      departmentId: addForm.departmentId,
      date: timestamp.split('T')[0],
      timeSlot: 'Emergency',
      symptoms: addForm.symptoms,
      existingConditions: addForm.conditions.length ? addForm.conditions : undefined,
      notes: addForm.notes || 'Emergency walk-in patient added by admin',
      priority,
      status: 'in_queue',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    addToQueue({
      appointmentId: id,
      patientId: `walk-in-${Date.now()}`,
      patientName: addForm.patientName.trim(),
      doctorId: addForm.doctorId,
      departmentId: addForm.departmentId,
      priority,
      status: 'waiting',
      checkInTime: timestamp,
      estimatedWaitTime: 5,
      position: 0,
      date: timestamp.split('T')[0],
      timeSlot: 'Emergency',
    });

    setAddSuccess(`${addForm.patientName.trim()} has been added to the queue with HIGH priority (Score: ${priority.total}).`);
    setAddForm({ patientName: '', departmentId: '', doctorId: '', symptoms: '', conditions: [], notes: '' });
    setAddSubmitting(false);
    load();

    setTimeout(() => setAddSuccess(''), 5000);
  };

  const toggleCondition = (c: string) => {
    setAddForm(prev => ({
      ...prev,
      conditions: prev.conditions.includes(c)
        ? prev.conditions.filter(x => x !== c)
        : [...prev.conditions, c],
    }));
  };

  const priorityBadge = (level: string) => {
    const cls = level === 'high' ? 'bg-priority-high-bg text-priority-high' : level === 'medium' ? 'bg-priority-medium-bg text-priority-medium' : 'bg-priority-low-bg text-priority-low';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${cls}`}>{level}</span>;
  };

  const renderEntry = (entry: QueueEntry, isInProgress: boolean) => {
    const apt = getAppointment(entry.appointmentId);
    const doc = getDoctor(entry.doctorId);
    const dept = getDepartment(entry.departmentId);
    const isEditing = editingId === entry.appointmentId;

    // Live countdown logic based on queue position
    // position 1 = 15 mins from checkInTime, position 2 = 30 mins, etc.
    const expectedDurationMs = entry.position * 15 * 60000;
    const estimatedTimeMs = new Date(entry.checkInTime).getTime() + expectedDurationMs;
    const diffMs = estimatedTimeMs - now;

    const isOverdue = diffMs <= 0;
    const diffMinutes = Math.floor(Math.abs(diffMs) / 60000);
    const diffSeconds = Math.floor((Math.abs(diffMs) % 60000) / 1000);
    const timerStr = `${isOverdue ? '-' : ''}${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`;

    return (
      <div key={entry.appointmentId} className={`bg-white rounded-2xl border ${isOverdue && !isInProgress ? 'border-red-400 shadow-sm shadow-red-100' : 'border-border/50'} p-5 hover:shadow-sm transition-all`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isInProgress ? 'bg-orange-100 text-orange-600' : 'bg-surface-secondary text-text-muted'}`}>
              {isInProgress ? '⚡' : `#${entry.position}`}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{entry.patientName}</p>
              <p className="text-xs text-text-muted mt-0.5">{dept?.icon} {dept?.name} • {doc?.name}</p>
              {apt && <p className="text-xs text-text-secondary mt-1">{apt.symptoms.slice(0, 60)}{apt.symptoms.length > 60 ? '...' : ''}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              {priorityBadge(entry.priority.level)}
              {!isInProgress && (
                <>
                  <span className="text-xs text-text-muted">Score: {entry.priority.total}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-surface-secondary text-text-secondary'}`}>
                    {timerStr}
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-1.5">
              {!isInProgress && (
                <>
                  <button onClick={() => { setEditingId(isEditing ? null : entry.appointmentId); setEditScore(entry.priority.total); setEditLevel(entry.priority.level); }}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs font-medium text-text-secondary hover:bg-surface-hover transition-all">
                    {isEditing ? 'Cancel' : 'Edit Priority'}
                  </button>
                  <button onClick={() => markInProgress(entry.appointmentId)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-all">
                    In Progress
                  </button>
                  <button onClick={() => removeEntry(entry.appointmentId)}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-all">
                    Remove
                  </button>
                </>
              )}
              {isInProgress && (
                <button onClick={() => markComplete(entry.appointmentId)}
                  className="px-4 py-1.5 rounded-lg bg-green-500 text-xs font-bold text-white hover:bg-green-600 transition-all shadow-sm">
                  Completed Treatment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Priority Panel */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-border/30 animate-fade-in">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Level</label>
                <select value={editLevel} onChange={(e) => setEditLevel(e.target.value as typeof editLevel)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-text-muted block mb-1">Score: {editScore}</label>
                <input type="range" min="0" max="100" value={editScore} onChange={(e) => setEditScore(Number(e.target.value))}
                  className="w-full accent-brand" />
              </div>
              <button onClick={() => handlePriorityChange(entry.appointmentId)}
                className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-all shadow-sm">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const canSubmitAdd = addForm.patientName.trim() && addForm.departmentId && addForm.doctorId && addForm.symptoms.trim().length > 3;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Queue Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddPanel(!showAddPanel); setAddSuccess(''); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${showAddPanel ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-priority-high text-white hover:opacity-90'}`}
          >
            {showAddPanel ? '✕ Close' : '🚨 Add Emergency Patient'}
          </button>
        </div>
      </div>

      {/* Add Emergency Patient Panel */}
      {showAddPanel && (
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-lg">🚨</div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Add Emergency Patient</h2>
              <p className="text-xs text-text-muted">Register a walk-in or emergency patient directly into the priority queue.</p>
            </div>
          </div>

          {addSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 animate-fade-in flex items-center gap-2">
              <span>✅</span> {addSuccess}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Patient Name *</label>
              <input
                type="text"
                value={addForm.patientName}
                onChange={(e) => setAddForm(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Full name of the patient"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Department *</label>
              <select
                value={addForm.departmentId}
                onChange={(e) => setAddForm(prev => ({ ...prev, departmentId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
              >
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Assign Doctor *</label>
              <select
                value={addForm.doctorId}
                onChange={(e) => setAddForm(prev => ({ ...prev, doctorId: e.target.value }))}
                disabled={!addForm.departmentId}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all disabled:opacity-50"
              >
                <option value="">{addForm.departmentId ? 'Select doctor' : 'Select department first'}</option>
                {addDoctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Symptoms / Condition *</label>
              <textarea
                value={addForm.symptoms}
                onChange={(e) => setAddForm(prev => ({ ...prev, symptoms: e.target.value }))}
                rows={2}
                placeholder="e.g., Severe chest pain, difficulty breathing, loss of consciousness..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all resize-none"
              />
            </div>
          </div>

          {/* Existing Conditions */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-2">Existing Conditions (optional)</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${addForm.conditions.includes(c) ? 'border-red-300 bg-red-50 text-red-700' : 'border-border text-text-secondary hover:border-red-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Admin Notes (optional)</label>
            <input
              type="text"
              value={addForm.notes}
              onChange={(e) => setAddForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            />
          </div>

          {/* Submit */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-text-muted">Emergency patients are automatically assigned <strong>HIGH</strong> priority.</p>
            <button
              onClick={handleAddPatient}
              disabled={!canSubmitAdd || addSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-priority-high hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {addSubmitting ? 'Adding…' : 'Add to Queue'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Waiting', value: waitingList.length, color: 'text-brand' },
          { label: 'In Progress', value: inProgressList.length, color: 'text-orange-600' },
          { label: 'High Priority', value: waitingList.filter((e) => e.priority.level === 'high').length, color: 'text-priority-high' },
          { label: 'Medium Priority', value: waitingList.filter((e) => e.priority.level === 'medium').length, color: 'text-priority-medium' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..."
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* In Progress List */}
      {inProgressList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-text-primary mb-3">Currently Treating</h2>
          <div className="space-y-3">
             {inProgressList.map(entry => renderEntry(entry, true))}
          </div>
        </div>
      )}

      {/* Waiting List */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-3">Up Next</h2>
        {waitingList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-text-muted">No patients waiting matching filters.</div>
        ) : (
          <div className="space-y-3">
            {waitingList.map(entry => renderEntry(entry, false))}
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted text-center mt-6">Auto-refreshes every 15 seconds</p>

      {/* Stylish Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-primary border border-border shadow-lg shadow-black/5 rounded-2xl px-6 py-3 text-sm font-medium text-text-primary flex items-center gap-3 animate-fade-in z-50">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-xs">🔔</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
