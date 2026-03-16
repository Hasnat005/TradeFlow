import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

type AppState = {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  themeMode: 'light',
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
}));
