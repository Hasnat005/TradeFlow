import { darkTheme, lightTheme } from '../theme';
import { useThemeMode } from './useThemeMode';

export function useAppTheme() {
  const { mode } = useThemeMode();

  return mode === 'dark' ? darkTheme : lightTheme;
}
