import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';
import { useThemeMode } from '../hooks/useThemeMode';
import { usePortfolioSummary } from '../features/portfolio/hooks/usePortfolioSummary';
import { formatCurrency } from '../utils/formatCurrency';

export function HomeScreen() {
  const theme = useAppTheme();
  const { mode, toggleThemeMode } = useThemeMode();
  const portfolioQuery = usePortfolioSummary();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.heading, { color: theme.colors.text }]}>TradeFlow</Text>
      <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Fintech platform foundation</Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.label, { color: theme.colors.muted }]}>Theme Mode</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{mode}</Text>

        <Text style={[styles.label, { color: theme.colors.muted }]}>Portfolio Value</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {portfolioQuery.isLoading
            ? 'Loading...'
            : portfolioQuery.isError
              ? 'Unavailable'
              : formatCurrency(portfolioQuery.data?.totalValueUsd ?? 0)}
        </Text>
      </View>

      <Pressable style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={toggleThemeMode}>
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  heading: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
