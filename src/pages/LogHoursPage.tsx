import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { storage, datesForMonth, getDayName, calculateDayEntry, makeCsvFromEntries, getMonthTotals } from '../lib/supabase';

export function LogHoursPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [entries, setEntries] = useState(storage.getHours());

  useEffect(() => {
    setEntries(storage.getHours());
  }, [user]);

  const rows = useMemo(() => datesForMonth(month).map((dateValue) => {
    const saved = entries[dateValue] || { inTime: '', outDate: dateValue, outTime: '' };
    return { dateValue, saved };
  }), [entries, month]);

  const totals = useMemo(() => {
    if (!user) return { minutes: 0, hours: '0:00', days: '0.00', amount: '0' };
    return getMonthTotals(entries, user.hourlyRate);
  }, [entries, user]);

  const updateEntry = (dateValue: string, field: 'inTime' | 'outDate' | 'outTime', value: string) => {
    const current = entries[dateValue] || { inTime: '', outDate: dateValue, outTime: '' };
    const next = { ...current, [field]: value };
    const updated = { ...entries, [dateValue]: next };
    setEntries(updated);
    storage.saveHours(updated);
  };

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Log hours</p>
          <h2 className="mt-2 text-2xl font-bold">Daily time entries</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">
            Month
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2" />
          </label>
          <Button variant="secondary" onClick={exportCsv} className="inline-flex items-center gap-2">
            <Download size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Date</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Day</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">In time</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Out date</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Out time</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Hours</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Total min</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Total hours</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Total day</th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map(({ dateValue, saved }) => {
              const result = user ? calculateDayEntry(dateValue, saved, user.hourlyRate) : { minutes: 0, duration: '0:00', decimalHours: '0.0', totalDay: '0.00', amountText: '0' };

              return (
                <tr key={dateValue}>
                  <td className="px-3 py-3 text-sm text-slate-700"><input type="date" value={dateValue} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1" /></td>
                  <td className="px-3 py-3 text-sm text-slate-700">{getDayName(dateValue)}</td>
                  <td className="px-3 py-3 text-sm text-slate-700"><input type="time" value={saved.inTime} onChange={(event) => updateEntry(dateValue, 'inTime', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1" /></td>
                  <td className="px-3 py-3 text-sm text-slate-700"><input type="date" value={saved.outDate || dateValue} onChange={(event) => updateEntry(dateValue, 'outDate', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1" /></td>
                  <td className="px-3 py-3 text-sm text-slate-700"><input type="time" value={saved.outTime} onChange={(event) => updateEntry(dateValue, 'outTime', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1" /></td>
                  <td className="px-3 py-3 text-sm text-slate-700">{result.duration || ''}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{result.minutes || 0}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{result.decimalHours || '0.0'}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{result.totalDay || '0.00'}</td>
                  <td className="px-3 py-3 text-sm text-slate-700">{result.amountText || '0'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <th colSpan={6} className="px-3 py-3 text-left text-sm font-semibold text-slate-700">Monthly total</th>
              <td className="px-3 py-3 text-sm text-slate-700">{totals.minutes}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{totals.hours}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{totals.days}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{totals.amount}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
