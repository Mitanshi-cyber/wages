import { BarChart3, Calculator, Clock3, LogOut, Settings, UserCircle2 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/log-hours', label: 'Log Hours', icon: Clock3 },
  { to: '/calculator', label: 'Wage Calculator', icon: Calculator },
  { to: '/history', label: 'Salary History', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const { user, signOut } = useAuth();
  const name = user?.name ?? 'Employee';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white">
              W
            </div>
            <div>
              <div className="text-xl font-bold">WageFlow</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Employee portal</p>
              <h1 className="text-xl font-semibold">Welcome back</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <UserCircle2 size={24} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{name}</div>
                <div className="text-xs text-slate-500">Active employee</div>
              </div>
            </div>
          </header>

          <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
