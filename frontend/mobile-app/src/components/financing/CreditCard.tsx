import { StyleSheet, Text, View } from 'react-native';

import { CreditInsights } from '../../features/financing/types';
import { formatCurrency } from '../../features/financing/utils';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  insights: CreditInsights;
};

export function CreditCard({ insights }: Props) {
  const theme = useAppTheme();
  const utilization = insights.totalLimit > 0 ? Math.round((insights.usedLimit / insights.totalLimit) * 100) : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          ...theme.shadow,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Credit Insights</Text>
      <Text style={[styles.utilization, { color: theme.colors.primary }]}>{utilization}% of credit limit used</Text>

      <View style={styles.rowBetween}>
        <Text style={[styles.metaLabel, { color: theme.colors.muted }]}>Available</Text>
        <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formatCurrency(insights.availableLimit)}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={[styles.metaLabel, { color: theme.colors.muted }]}>Used</Text>
        <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formatCurrency(insights.usedLimit)}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={[styles.metaLabel, { color: theme.colors.muted }]}>Total Limit</Text>
        <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formatCurrency(insights.totalLimit)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  utilization: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
