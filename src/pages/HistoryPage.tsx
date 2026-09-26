import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage, type SalaryRecord } from '../lib/supabase';

export function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<SalaryRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    setRecords(storage.getSalaryRecords());
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Salary history</p>
        <h2 className="mt-2 text-2xl font-bold">Your past periods</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Period</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Hours</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Amount</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Computed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {records.length ? records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{record.periodStart} → {record.periodEnd}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{record.totalHours}</td>
                <td className="px-4 py-3 text-sm text-slate-700">${Number(record.computedWage).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{new Date(record.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No salary records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
