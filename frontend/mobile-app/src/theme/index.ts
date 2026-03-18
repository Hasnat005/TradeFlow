export const lightTheme = {
  statusBarStyle: 'dark' as const,
  colors: {
    background: '#F7F9FC',
    surface: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    primary: '#0B6BFF',
    onPrimary: '#FFFFFF',
    border: '#E5E7EB',
    danger: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
    info: '#2563EB',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
  },
  shadow: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const darkTheme = {
  statusBarStyle: 'light' as const,
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#3B82F6',
    onPrimary: '#FFFFFF',
    border: '#334155',
    danger: '#F87171',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#60A5FA',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
  },
  shadow: {
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
};

export type AppTheme = typeof lightTheme;
