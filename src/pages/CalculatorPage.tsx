import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage, datesForMonth, getMonthTotals, getDayName, calculateDayEntry, makeCsvFromEntries } from '../lib/supabase';

export function CalculatorPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const entries = storage.getHours();

  const summary = useMemo(() => {
    if (!user) return { totalHours: 0, gross: 0, deductions: 0, net: 0, amount: '0', hours: '0:00', days: '0.00' };
    const monthEntries = Object.fromEntries(
      datesForMonth(month).map((dateValue) => [dateValue, entries[dateValue] || { inTime: '', outDate: dateValue, outTime: '' }]),
    );
    const totals = getMonthTotals(monthEntries, user.hourlyRate);
    const gross = Number(totals.amount || 0);
    return {
      totalHours: totals.minutes / 60,
      gross,
      deductions: 0,
      net: gross,
      amount: totals.amount,
      hours: totals.hours,
      days: totals.days,
    };
  }, [entries, month, user]);

  const exportCsv = () => {
    if (!user) return;
    const csv = makeCsvFromEntries(entries, user.hourlyRate, month);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(user.name || 'employee').replace(/\s+/g, '-').toLowerCase()}-${month}-salary.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Wage calculator</p>
          <h2 className="mt-2 text-2xl font-bold">Salary overview</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">
            Month
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2" />
          </label>
          <button onClick={exportCsv} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Export CSV</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-white p-4">
              <span className="text-slate-600">Hourly rate</span>
              <span className="font-semibold">${user?.hourlyRate.toFixed(2) ?? '0.00'}/hr</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white p-4">
              <span className="text-slate-600">Total hours</span>
              <span className="font-semibold">{summary.totalHours.toFixed(1)} hrs</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white p-4">
              <span className="text-slate-600">Gross pay</span>
              <span className="font-semibold">${summary.gross.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white p-4">
              <span className="text-slate-600">Deductions</span>
              <span className="font-semibold">-${summary.deductions.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-primary-50 p-4 text-primary-700">
              <span className="font-semibold">Net pay</span>
              <span className="text-xl font-bold">${summary.net.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold">Breakdown</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Hours × rate</span>
              <span>{summary.totalHours.toFixed(1)} × ${user?.hourlyRate.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gross</span>
              <span>${summary.gross.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Existing deductions</span>
              <span>${summary.deductions.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-semibold text-slate-800">
              <span>Net</span>
              <span>${summary.net.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
