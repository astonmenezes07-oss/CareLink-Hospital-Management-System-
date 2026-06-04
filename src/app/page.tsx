import Link from 'next/link';
import Navbar from '@/components/Navbar';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Book Your Appointment',
    desc: 'Select your department, choose a doctor, pick a time, and describe your symptoms — all online.',
  },
  {
    step: '02',
    title: 'Automatic Priority Assessment',
    desc: 'Our system analyzes your symptoms using medically-inspired protocols (including WHO ETAT ABCD concepts) to estimate urgency.',
  },
  {
    step: '03',
    title: 'Smart Queue Placement',
    desc: 'You are placed in a priority queue — critical cases are seen first while routine visits follow in order.',
  },
  {
    step: '04',
    title: 'Real-Time Updates',
    desc: 'Track your queue position and estimated wait time live. Receive notifications as your turn approaches.',
  },
  {
    step: '05',
    title: 'See Your Doctor',
    desc: 'When it is your turn, proceed directly to your assigned doctor for treatment — no unnecessary delays.',
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* ======== HERO ======== */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-surface-accent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/60 text-brand-dark text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-soft" />
              Intelligent Hospital Queue Management
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Faster Care for{' '}
              <span className="text-brand">Those Who Need</span>{' '}
              It Most
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed">
              CareLink replaces first-come-first-serve with intelligent
              priority-based scheduling. Book appointments, track your queue in
              real-time, and receive care when you need it.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/patient/signup"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Book Appointment
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-text-primary bg-white hover:bg-surface-hover border border-border rounded-xl transition-all duration-200"
              >
                Patient Login
              </Link>
              <Link
                href="/auth/admin/login"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-navy hover:text-brand transition-colors"
              >
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======== ABOUT ======== */}
      <section id="about" className="py-20 lg:py-28 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Why Choose CareLink?
            </h2>
            <p className="mt-4 text-base text-text-secondary leading-relaxed">
              A smarter approach to hospital queue management — built around what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Reduced Wait Times',
                desc: 'Patients with critical conditions are seen first. Smart prioritization means less time waiting and more time healing.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
              },
              {
                title: 'Emergency Detection',
                desc: 'Life-threatening symptoms are automatically flagged and fast-tracked so critical patients receive immediate care.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
                  </svg>
                ),
              },
              {
                title: 'Transparent Process',
                desc: 'Track your exact queue position and estimated wait time in real-time — no guesswork, no uncertainty.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center px-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Everything You Need
            </h2>
            <p className="mt-4 text-base text-text-secondary leading-relaxed">
              Tools for patients, doctors, and administrators — all in one platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Online Booking',
                desc: 'Book appointments from anywhere — select your department, doctor, and time slot online.',
                icon: '📅',
              },
              {
                title: 'Live Queue Tracking',
                desc: 'Monitor your real-time position and estimated wait before you even leave home.',
                icon: '📊',
              },
              {
                title: 'Smart Priority Scoring',
                desc: 'Symptom analysis assigns accurate priority levels so critical cases get seen first.',
                icon: '🧠',
              },
              {
                title: 'Doctor Availability',
                desc: 'View real-time doctor schedules and find the best time for your visit.',
                icon: '🩺',
              },
              {
                title: 'Instant Notifications',
                desc: 'Receive updates on appointments, queue movements, and priority changes.',
                icon: '🔔',
              },
              {
                title: 'Admin Queue Control',
                desc: 'Hospital staff can manage queues, adjust priorities, and add emergency patients.',
                icon: '⚙️',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-white hover:border-brand/20 hover:shadow-sm transition-all duration-300"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              How CareLink Works
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              From booking to treatment — a streamlined journey designed around
              patient needs.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Vertical connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[23px] top-12 bottom-0 w-px bg-border" />
                )}
                {/* Step circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {item.step}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Brief ABCD reference */}
          <div className="mt-16 max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-border/50">
            <h3 className="text-base font-semibold text-text-primary mb-3">
              Triage-Inspired Prioritization
            </h3>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Our priority engine draws inspiration from the WHO ETAT (Emergency
              Triage Assessment and Treatment) framework, evaluating patients
              across four key dimensions:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { letter: 'A', label: 'Airway', desc: 'Obstruction, choking, throat conditions' },
                { letter: 'B', label: 'Breathing', desc: 'Respiratory distress, oxygen levels' },
                { letter: 'C', label: 'Circulation', desc: 'Pulse, consciousness, bleeding' },
                { letter: 'D', label: 'Dehydration', desc: 'Fluid levels, lethargy indicators' },
              ].map((item) => (
                <div
                  key={item.letter}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-100 text-brand-dark flex items-center justify-center text-sm font-bold">
                    {item.letter}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {item.label}
                    </p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== APPOINTMENTS CTA ======== */}
      <section id="appointments" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Skip the Wait?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join CareLink today and experience healthcare that puts your
                time and well-being first.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/patient/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-brand bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Book Your Appointment
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all duration-200"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="py-10 border-t border-border bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-text-primary">
                CareLink
              </span>
            </div>
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} CareLink. Intelligent Hospital Queue
              Management System.
            </p>
            <div className="flex gap-6">
              <Link href="/auth" className="text-xs text-text-muted hover:text-brand transition-colors">
                Patient Login
              </Link>
              <Link href="/auth/admin/login" className="text-xs text-text-muted hover:text-brand transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
