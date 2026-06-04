'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { initStore } from '@/lib/store';
import { getCurrentSession } from '@/lib/auth';

export default function AuthRoleSelect() {
  const router = useRouter();

  useEffect(() => {
    initStore();
    const session = getCurrentSession();
    if (session) {
      router.replace(
        session.role === 'admin' ? '/dashboard/admin' : '/dashboard/patient'
      );
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-accent p-4">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <span className="text-xl font-bold text-text-primary">CareLink</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-8">
          <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
            Welcome to CareLink
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8">
            Select your role to continue
          </p>

          <div className="grid gap-4">
            {/* Patient */}
            <Link
              href="/auth/patient/login"
              className="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-brand bg-surface-secondary hover:bg-brand-50 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-100 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-200">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Patient / User
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Book appointments, track queue, manage health records
                </p>
              </div>
              <svg className="absolute right-4 w-5 h-5 text-text-muted group-hover:text-brand transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>

            {/* Admin */}
            <Link
              href="/auth/admin/login"
              className="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-navy bg-surface-secondary hover:bg-surface-accent transition-all duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all duration-200">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Administrator
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Manage queues, patients, doctors, and hospital workflows
                </p>
              </div>
              <svg className="absolute right-4 w-5 h-5 text-text-muted group-hover:text-navy transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          <Link href="/" className="hover:text-brand transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
