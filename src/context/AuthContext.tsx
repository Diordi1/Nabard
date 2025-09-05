import React, { createContext, useContext, useEffect, useState } from 'react';

export interface DemoUser {
  farmerId: string;
  name: string;
  mobile?: string;
  email?: string;
  provider: 'google' | 'phone' | 'local';
  createdAt: string;
}

interface AuthContextShape {
  user: DemoUser | null;
  loginWithGoogle: () => void;
  loginWithPhone: () => void;
  signupLocal: (data: { name: string; mobile: string; email: string; password: string }) => void;
  loginEmailPassword: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);
const LS_KEY = 'demo_active_user';
const LS_USERS = 'demo_registered_users';

function generateFarmerId() {
  return 'FRM-' + Math.floor(Math.random()*1_000_000).toString().padStart(6,'0');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const loadRegistered = (): any[] => {
    try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); } catch { return []; }
  };
  const saveRegistered = (arr: any[]) => {
    try { localStorage.setItem(LS_USERS, JSON.stringify(arr)); } catch {}
  };

  const persist = (u: DemoUser) => {
    setUser(u);
    try { localStorage.setItem(LS_KEY, JSON.stringify(u)); } catch {}
  };

  const loginWithGoogle = () => {
    persist({
      farmerId: generateFarmerId(),
      name: 'Google Demo User',
      email: 'google.demo@example.com',
      provider: 'google',
      createdAt: new Date().toISOString()
    });
  };

  const loginWithPhone = () => {
    persist({
      farmerId: generateFarmerId(),
      name: 'Phone Demo User',
      mobile: '9999999999',
      provider: 'phone',
      createdAt: new Date().toISOString()
    });
  };

  const signupLocal = (data: { name: string; mobile: string; email: string; password: string }) => {
    const users = loadRegistered();
    const existing = users.find((u: any) => u.email === data.email);
    if (!existing) {
      users.push({
        farmerId: generateFarmerId(),
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        password: data.password,
        provider: 'local',
        createdAt: new Date().toISOString()
      });
      saveRegistered(users);
    }
    const record = users.find((u: any) => u.email === data.email);
    persist({ ...record, password: undefined });
  };

  const loginEmailPassword = (email: string, password: string) => {
    const users = loadRegistered();
    const found = users.find((u: any) => u.email === email);
    if (!found) return { ok: false, error: 'User not found' };
    if (found.password !== password) return { ok: false, error: 'Invalid password' };
    persist({ ...found, password: undefined });
    return { ok: true };
  };

  const logout = () => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loginWithGoogle, loginWithPhone, signupLocal, loginEmailPassword, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
