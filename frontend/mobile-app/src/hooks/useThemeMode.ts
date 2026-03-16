import { useAppStore } from '../store/useAppStore';

export function useThemeMode() {
  const mode = useAppStore((state) => state.themeMode);
  const toggleThemeMode = useAppStore((state) => state.toggleThemeMode);

  return { mode, toggleThemeMode };
}
