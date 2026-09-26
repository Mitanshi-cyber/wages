import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/supabase';

export function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setHourlyRate(String(user.hourlyRate));
  }, [user]);

  const handleSubmit = () => {
    if (!user) return;

    const profiles = storage.getProfiles();
    const updatedProfiles = profiles.map((profile) =>
      profile.id === user.id ? { ...profile, name, hourlyRate: Number(hourlyRate) } : profile,
    );

    storage.saveProfiles(updatedProfiles);
    setMessage('Profile updated successfully.');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Settings</p>
        <h2 className="mt-2 text-2xl font-bold">Employee profile</h2>
      </div>

      <div className="max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Display name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hourly rate</label>
            <input type="number" step="0.01" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </div>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          <Button onClick={handleSubmit}>Save profile</Button>
        </div>
      </div>
    </div>
  );
}
