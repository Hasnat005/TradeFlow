import { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { useAppTheme } from '../hooks/useAppTheme';
import { queryClient } from '../services/queryClient';

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useAppTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            primary: theme.colors.primary,
            border: theme.colors.border,
            notification: theme.colors.primary,
          },
        }}
      >
        {children}
      </NavigationContainer>
      <StatusBar style={theme.statusBarStyle} />
    </QueryClientProvider>
  );
}