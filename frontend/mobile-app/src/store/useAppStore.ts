import { create } from 'zustand';

import { clearAuthSession, readAuthSession, storeAuthSession } from '../services/authStorage';

type ThemeMode = 'light' | 'dark';

type AppState = {
  themeMode: ThemeMode;
  authToken?: string;
  isAuthenticated: boolean;
  isAuthHydrated: boolean;
  userName?: string;
  companyName?: string;
  toggleThemeMode: () => void;
  login: (session?: { token: string; userName: string; companyName: string }, persist?: boolean) => Promise<void>;
  hydrateAuthSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  themeMode: 'light',
  authToken: undefined,
  isAuthenticated: false,
  isAuthHydrated: false,
  userName: 'Ava',
  companyName: 'Hasnat Traders Ltd.',
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
  login: async (session, persist = true) => {
    if (session && persist) {
      await storeAuthSession(session.token, session.userName, session.companyName);
    } else if (!persist) {
      await clearAuthSession();
    }

    set(() => ({
      authToken: session?.token,
      userName: session?.userName ?? 'Ava',
      companyName: session?.companyName ?? 'Hasnat Traders Ltd.',
      isAuthenticated: true,
      isAuthHydrated: true,
    }));
  },
  hydrateAuthSession: async () => {
    const existingSession = await readAuthSession();

    if (!existingSession) {
      set(() => ({ isAuthHydrated: true }));
      return;
    }

    set(() => ({
      authToken: existingSession.token,
      userName: existingSession.userName,
      companyName: existingSession.companyName,
      isAuthenticated: true,
      isAuthHydrated: true,
    }));
  },
  logout: async () => {
    await clearAuthSession();

    set(() => ({
      authToken: undefined,
      isAuthenticated: false,
      isAuthHydrated: true,
    }));
  },
}));
