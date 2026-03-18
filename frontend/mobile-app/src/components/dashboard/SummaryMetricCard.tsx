import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type SummaryMetricCardProps = {
  title: string;
  value: string;
  helper: string;
  width: number;
};

export function SummaryMetricCard({ title, value, helper, width }: SummaryMetricCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          width,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          ...theme.shadow,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.muted }]}>{title}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.helper, { color: theme.colors.info }]}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  helper: {
    fontSize: 12,
    fontWeight: '600',
  },
});
