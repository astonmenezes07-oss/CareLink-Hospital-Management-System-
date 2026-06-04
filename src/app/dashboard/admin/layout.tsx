'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { requireAuth, logout } from '@/lib/auth';
import { initStore, loadQueue } from '@/lib/store';
import type { AuthSession } from '@/types';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: 'grid' },
  { label: 'Queue Management', href: '/dashboard/admin/queue', icon: 'queue' },
  { label: 'Appointments', href: '/dashboard/admin/appointments', icon: 'calendar' },
  { label: 'Doctors', href: '/dashboard/admin/doctors', icon: 'stethoscope' },
  { label: 'Patients', href: '/dashboard/admin/patients', icon: 'users' },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: 'chart' },
];

function NavIcon({ name, className = '' }: { name: string; className?: string }) {
  const cn = `w-5 h-5 ${className}`;
  switch (name) {
    case 'grid':
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
    case 'queue':
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
    case 'calendar':
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'stethoscope':
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>;
    case 'users':
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'chart':
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    default:
      return null;
  }
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initStore();
    const s = requireAuth('admin');
    if (!s) { router.replace('/auth'); return; }
    setSession(s);
    const pq = loadQueue();
    setEmergencyCount(pq.getAll().filter((e) => e.priority.level === 'high' && e.status === 'waiting').length);
    setReady(true);
  }, [router, pathname]);

  const handleLogout = () => { logout(); router.push('/auth'); };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="animate-pulse-soft text-navy text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Navy sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[260px] bg-navy flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
          </div>
          <span className="text-base font-semibold text-white">CareLink Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                <NavIcon name={link.icon} className={isActive ? 'text-white' : 'text-white/60'} />
                {link.label}
                {link.icon === 'queue' && emergencyCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-priority-high text-white text-[10px] font-bold">{emergencyCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-lg border-b border-border flex items-center px-4 lg:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-text-primary">Admin Panel</h2>
            <p className="text-xs text-text-muted">{session?.name}</p>
          </div>
          {emergencyCount > 0 && (
            <Link href="/dashboard/admin/queue" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-priority-high-bg text-priority-high text-xs font-semibold animate-pulse-soft">
              <span className="w-2 h-2 rounded-full bg-priority-high" />
              {emergencyCount} Emergency
            </Link>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
