import { PropsWithChildren, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppTheme } from '../hooks/useAppTheme';
import { queryClient } from '../services/queryClient';
import { useAppStore } from '../store/useAppStore';

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  const isAuthHydrated = useAppStore((state) => state.isAuthHydrated);
  const hydrateAuthSession = useAppStore((state) => state.hydrateAuthSession);

  useEffect(() => {
    void hydrateAuthSession();
  }, [hydrateAuthSession]);

  return (
    <SafeAreaProvider>
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
          {isAuthHydrated ? (
            children
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.background,
              }}
            >
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}
        </NavigationContainer>
        <StatusBar style={theme.statusBarStyle} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}