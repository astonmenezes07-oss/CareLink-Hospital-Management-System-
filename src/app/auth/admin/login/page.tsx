'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAdmin, getCurrentSession } from '@/lib/auth';
import { initStore } from '@/lib/store';

export default function AdminLogin() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    initStore();
    const session = getCurrentSession();
    if (session?.role === 'admin') router.replace('/dashboard/admin');
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!adminId.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = loginAdmin(adminId.trim(), password);
      if (result.ok) {
        router.push('/dashboard/admin');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-accent via-white to-brand-50 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <span className="text-xl font-bold text-text-primary">CareLink</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-navy/10 text-navy mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-text-primary text-center mb-1">
            Admin Login
          </h1>
          <p className="text-sm text-text-secondary text-center mb-6">
            Hospital administration access
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Admin ID
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter your Admin ID"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {loading ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-lg bg-surface-secondary border border-border/50">
            <p className="text-xs text-text-muted text-center">
              <span className="font-medium">Demo Credentials:</span>
            </p>
            <p className="text-xs text-text-muted text-center mt-1">
              Admin ID:{' '}
              <code className="px-1 py-0.5 rounded bg-navy/10 text-navy text-xs">admin001</code>
              {' '} / Password:{' '}
              <code className="px-1 py-0.5 rounded bg-navy/10 text-navy text-xs">carelink2024</code>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          <Link href="/auth" className="hover:text-brand transition-colors">
            ← Back to role selection
          </Link>
        </p>
      </div>
    </div>
  );
}
