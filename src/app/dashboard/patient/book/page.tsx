'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { initStore, getSession, getDepartments, getDoctorsByDepartment, getDoctor, getDepartment, addAppointment, addToQueue, addNotification } from '@/lib/store';
import { analyzeSymptoms, quickEstimate } from '@/lib/symptom-analyzer';
import type { Department, Doctor } from '@/types';

const TIME_SLOTS = [
  '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
  '11:00 - 11:30', '11:30 - 12:00', '14:00 - 14:30', '14:30 - 15:00',
  '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00',
];

const CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Cancer', 'Kidney Disease', 'Pregnancy'];

export default function BookAppointment() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [livePreview, setLivePreview] = useState<{ level: string; score: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initStore();
    setDepartments(getDepartments());
  }, []);

  useEffect(() => {
    if (selectedDept) setDoctors(getDoctorsByDepartment(selectedDept));
  }, [selectedDept]);

  // Debounced live priority preview
  useEffect(() => {
    if (!symptoms.trim()) { setLivePreview(null); return; }
    const t = setTimeout(() => {
      setLivePreview(quickEstimate(symptoms));
    }, 300);
    return () => clearTimeout(t);
  }, [symptoms]);

  const today = new Date().toISOString().split('T')[0];

  const canNext = () => {
    switch (step) {
      case 1: return !!selectedDept;
      case 2: return !!selectedDoctor;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return symptoms.trim().length > 3;
      default: return true;
    }
  };

  const handleSubmit = useCallback(() => {
    const session = getSession();
    if (!session) return;

    setSubmitting(true);
    const priority = analyzeSymptoms(symptoms, undefined, undefined, conditions.length ? conditions : undefined);

    const id = `apt-${Date.now()}`;
    const now = new Date().toISOString();

    addAppointment({
      id,
      patientId: session.userId,
      doctorId: selectedDoctor,
      departmentId: selectedDept,
      date: selectedDate,
      timeSlot: selectedTime,
      symptoms,
      existingConditions: conditions.length ? conditions : undefined,
      notes: notes || undefined,
      priority,
      status: 'in_queue',
      createdAt: now,
      updatedAt: now,
    });

    const doctor = getDoctor(selectedDoctor);
    addToQueue({
      appointmentId: id,
      patientId: session.userId,
      patientName: session.name,
      doctorId: selectedDoctor,
      departmentId: selectedDept,
      priority,
      status: 'waiting',
      checkInTime: now,
      estimatedWaitTime: 15,
      position: 0,
    });

    addNotification({
      id: `notif-${Date.now()}`,
      patientId: session.userId,
      type: 'appointment_confirmed',
      title: 'Appointment Booked',
      message: `Your appointment with ${doctor?.name || 'your doctor'} has been booked and you have been added to the queue with ${priority.level} priority.`,
      read: false,
      createdAt: now,
    });

    setTimeout(() => router.push('/dashboard/patient/appointments'), 600);
  }, [symptoms, conditions, selectedDoctor, selectedDept, selectedDate, selectedTime, notes, router]);

  const dept = getDepartment(selectedDept);
  const doctor = getDoctor(selectedDoctor);

  const priorityColor = (level: string) => level === 'high' ? 'text-priority-high bg-priority-high-bg border-priority-high/20' : level === 'medium' ? 'text-priority-medium bg-priority-medium-bg border-priority-medium/20' : 'text-priority-low bg-priority-low-bg border-priority-low/20';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Book Appointment</h1>
        <p className="text-sm text-text-secondary mt-1">Follow the steps below to schedule your visit.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? 'bg-brand text-white shadow-sm' : s < step ? 'bg-brand-100 text-brand' : 'bg-surface-secondary text-text-muted border border-border'}`}>
              {s < step ? '✓' : s}
            </div>
            {s < 5 && <div className={`flex-1 h-0.5 rounded ${s < step ? 'bg-brand' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-border/50 p-6">
        {/* Step 1: Department */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Select Department</h2>
            <p className="text-sm text-text-muted mb-5">Choose the department for your visit.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDept(d.id); setSelectedDoctor(''); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedDept === d.id ? 'border-brand bg-brand-50' : 'border-border hover:border-brand/30 hover:bg-surface-hover'}`}
                >
                  <span className="text-2xl">{d.icon}</span>
                  <p className="text-sm font-semibold text-text-primary mt-2">{d.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{d.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Doctor */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Select Doctor</h2>
            <p className="text-sm text-text-muted mb-5">Choose your preferred doctor from {dept?.name}.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoctor(d.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedDoctor === d.id ? 'border-brand bg-brand-50' : 'border-border hover:border-brand/30 hover:bg-surface-hover'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand flex items-center justify-center text-sm font-bold">{d.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{d.name}</p>
                      <p className="text-xs text-text-muted">{d.specialization}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                    <span>{d.qualification}</span>
                    <span>•</span>
                    <span>{d.experience}y exp</span>
                    <span>•</span>
                    <span className={d.currentPatients >= d.maxPatients ? 'text-priority-high' : 'text-priority-low'}>{d.currentPatients}/{d.maxPatients} patients</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Select Date & Time</h2>
            <p className="text-sm text-text-muted mb-5">Pick your preferred appointment slot.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Time Slot</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${selectedTime === t ? 'border-brand bg-brand-50 text-brand' : 'border-border hover:border-brand/30 text-text-secondary hover:bg-surface-hover'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Symptoms */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Describe Your Symptoms</h2>
            <p className="text-sm text-text-muted mb-5">This helps us prioritize your appointment.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Symptoms *</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  placeholder="e.g., Chest pain, shortness of breath, high fever..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
                />
                {/* Live preview */}
                {livePreview && (
                  <div className={`mt-2 p-3 rounded-xl border flex items-center gap-3 ${priorityColor(livePreview.level)} animate-fade-in`}>
                    <span className="text-xs font-bold">Estimated Priority:</span>
                    <span className="text-xs font-bold uppercase">{livePreview.level}</span>
                    <span className="text-xs opacity-70">(Score: {livePreview.score}/100)</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Existing Conditions (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${conditions.includes(c) ? 'border-brand bg-brand-50 text-brand' : 'border-border text-text-secondary hover:border-brand/30'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Additional Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional information..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Review & Confirm</h2>
            <p className="text-sm text-text-muted mb-5">Please review your appointment details.</p>
            <div className="space-y-3">
              {[
                { label: 'Department', value: dept?.name, icon: dept?.icon },
                { label: 'Doctor', value: doctor?.name },
                { label: 'Date', value: selectedDate },
                { label: 'Time', value: selectedTime },
                { label: 'Symptoms', value: symptoms },
                { label: 'Conditions', value: conditions.length ? conditions.join(', ') : 'None' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start py-2 border-b border-border/30 last:border-0">
                  <span className="text-sm text-text-muted">{item.label}</span>
                  <span className="text-sm font-medium text-text-primary text-right max-w-[60%]">{item.icon && <span className="mr-1">{item.icon}</span>}{item.value}</span>
                </div>
              ))}
            </div>
            {livePreview && (
              <div className={`mt-4 p-4 rounded-xl border ${priorityColor(livePreview.level)}`}>
                <p className="text-sm font-semibold">Predicted Priority: <span className="uppercase">{livePreview.level}</span></p>
                <p className="text-xs mt-1 opacity-80">Score: {livePreview.score}/100 — {livePreview.level === 'high' ? 'You will be fast-tracked for immediate care.' : livePreview.level === 'medium' ? 'You will be placed ahead of routine visits.' : 'Standard waiting queue.'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-surface-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < 5 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-dark transition-all disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        )}
      </div>
    </div>
  );
}
