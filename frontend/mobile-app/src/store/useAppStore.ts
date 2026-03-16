import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

type AppState = {
  themeMode: ThemeMode;
  isAuthenticated: boolean;
  toggleThemeMode: () => void;
  login: () => void;
  logout: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  themeMode: 'light',
  isAuthenticated: false,
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
  login: () =>
    set(() => ({
      isAuthenticated: true,
    })),
  logout: () =>
    set(() => ({
      isAuthenticated: false,
    })),
}));
