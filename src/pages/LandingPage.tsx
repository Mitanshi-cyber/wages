import { ArrowRight, CheckCircle2, Download, PiggyBank, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

const features = [
  {
    icon: TimerReset,
    title: 'Log hours quickly',
    description: 'Track work blocks with a clean, employee-first daily log.',
  },
  {
    icon: PiggyBank,
    title: 'Instant wage calculation',
    description: 'See gross pay in real time based on your current hourly rate.',
  },
  {
    icon: Download,
    title: 'Download payslips',
    description: 'Export payroll snapshots and keep your records ready to review.',
  },
  {
    icon: CheckCircle2,
    title: 'Salary history',
    description: 'Look back at previous periods and understand your earnings over time.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white">
            W
          </div>
          <div>
            <div className="text-lg font-bold">WageFlow</div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/signin" className="text-sm font-medium text-slate-700">
            Sign In
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-12 md:grid-cols-2 md:items-center md:pt-20">
          <div>
            <span className="inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              smarter payroll
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              Track your hours, know your pay — instantly.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              WageFlow helps employees log hours, calculate pay, and monitor earnings in one clean personal dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button className="px-6 py-3 text-base">Get Started</Button>
              </Link>
              <Link to="/signin">
                <Button variant="secondary" className="px-6 py-3 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">This month</div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-3xl font-bold">126.5 hrs</div>
                  <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    +8.4%
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-primary-50 p-4">
                  <div className="text-sm text-primary-700">Gross pay</div>
                  <div className="mt-2 text-2xl font-bold">$3,640</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-sm text-slate-500">hourly rate</div>
                  <div className="mt-2 text-2xl font-bold">$28.75</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Hours logged</span>
                  <span className="font-medium text-slate-700">18.5 / 40</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[46%] rounded-full bg-primary-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Everything you need to manage your earnings</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Simple, transparent, and employee-first</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {['Create your secure employee account', 'Log hours and review your pay details', 'Track salary history and export records'].map((step, index) => (
                <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                    0{index + 1}
                  </div>
                  <p className="text-lg font-semibold">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-slate-200 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>© 2026 WageFlow</div>
        <div className="flex gap-6">
          <a href="#about">About</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
