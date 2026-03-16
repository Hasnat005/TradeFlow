export const lightTheme = {
  statusBarStyle: 'dark' as const,
  colors: {
    background: '#F6F8FC',
    surface: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    primary: '#0B6BFF',
    border: '#E5E7EB',
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
    border: '#334155',
  },
};

export type AppTheme = typeof lightTheme;
