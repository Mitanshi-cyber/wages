import { useEffect, useState } from 'react';
import { ArrowUpRight, CreditCard, DollarSign, TimerReset } from 'lucide-react';
import { storage, getMonthTotals } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ hours: 0, earnings: 0, lastPayout: '$0', rate: '$0/hr' });

  useEffect(() => {
    if (!user) return;

    const entries = storage.getHours();
    const monthValue = new Date().toISOString().slice(0, 7);
    const totals = getMonthTotals(entries, user.hourlyRate);
    const earnings = Number(totals.amount || 0);

    setSummary({
      hours: totals.minutes / 60,
      earnings,
      lastPayout: `$${(earnings * 0.8).toFixed(2)}`,
      rate: `$${user.hourlyRate.toFixed(2)}/hr`,
    });
  }, [user]);

  const cards = [
    { label: 'Hours logged this month', value: `${summary.hours.toFixed(1)} hrs`, icon: TimerReset },
    { label: 'Current period earnings', value: `$${summary.earnings.toFixed(2)}`, icon: DollarSign },
    { label: 'Last payout', value: summary.lastPayout, icon: CreditCard },
    { label: 'Hourly rate', value: summary.rate, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Overview</p>
        <h2 className="mt-2 text-2xl font-bold">{user?.name ?? 'Employee'} dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <div className="rounded-xl bg-primary-50 p-2 text-primary-700">
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-4 text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
