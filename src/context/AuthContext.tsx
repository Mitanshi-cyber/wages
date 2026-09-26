import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { storage, type EmployeeProfile } from '../lib/supabase';

interface AuthContextValue {
  user: { id: string; email: string; name: string; hourlyRate: number } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, hourlyRate: number) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserId = storage.getCurrentUser();
    if (!savedUserId) {
      setLoading(false);
      return;
    }

    const profiles = storage.getProfiles();
    const matched = profiles.find((profile) => profile.id === savedUserId);

    if (matched) {
      setUser({
        id: matched.id,
        email: matched.name.toLowerCase().replace(/\s+/g, '.') + '@demo.local',
        name: matched.name,
        hourlyRate: matched.hourlyRate,
      });
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const profiles = storage.getProfiles();
    const profile = profiles.find((item) => item.id === `${email}:${password}`);

    if (!profile) throw new Error('Invalid email or password.');

    const nextUser = {
      id: profile.id,
      email,
      name: profile.name,
      hourlyRate: profile.hourlyRate,
    };

    storage.saveCurrentUser(profile.id);
    setUser(nextUser);
  };

  const signUp = async (email: string, password: string, name: string, hourlyRate: number) => {
    const profiles = storage.getProfiles();
    const existing = profiles.find((profile) => profile.id === `${email}:${password}`);

    if (existing) {
      throw new Error('An account for this email already exists.');
    }

    const nextProfile: EmployeeProfile = {
      id: `${email}:${password}`,
      name,
      hourlyRate,
    };

    const updatedProfiles = [...profiles, nextProfile];
    storage.saveProfiles(updatedProfiles);
    storage.saveCurrentUser(nextProfile.id);
    setUser({ id: nextProfile.id, email, name, hourlyRate });
  };

  const signOut = async () => {
    storage.saveCurrentUser(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const profiles = storage.getProfiles();
    const exists = profiles.some((profile) => profile.id.startsWith(`${email}:`));

    if (!exists) {
      throw new Error('No account matches that email.');
    }

    // Frontend-only placeholder for the reset flow.
    return Promise.resolve();
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, signOut, resetPassword }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
