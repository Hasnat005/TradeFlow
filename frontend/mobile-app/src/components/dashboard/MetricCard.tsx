import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency } from '../../features/invoices/utils';

type MetricCardProps = {
  title: string;
  amount: number;
  insight: string;
  additional?: string;
  trend?: 'up' | 'down';
  highlighted?: boolean;
};

export function MetricCard({ title, amount, insight, additional, trend, highlighted }: MetricCardProps) {
  const theme = useAppTheme();

  const trendColor = trend === 'down' ? theme.colors.danger : theme.colors.success;
  const trendIcon = trend === 'down' ? 'arrow-down' : 'arrow-up';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: highlighted ? theme.colors.primary : theme.colors.surface,
          borderColor: highlighted ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
          ...theme.shadow,
        },
      ]}
    >
      <Text style={[styles.title, { color: highlighted ? theme.colors.onPrimary : theme.colors.muted }]}>
        {title}
      </Text>
      <Text style={[styles.amount, { color: highlighted ? theme.colors.onPrimary : theme.colors.text }]}>
        {formatCurrency(amount)}
      </Text>
      {additional ? (
        <Text style={[styles.additional, { color: highlighted ? 'rgba(255,255,255,0.92)' : theme.colors.muted }]}>
          {additional}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <Text
          style={[
            styles.insight,
            { color: highlighted ? 'rgba(255,255,255,0.9)' : theme.colors.muted },
          ]}
        >
          {insight}
        </Text>
        {trend ? <Ionicons name={trendIcon} size={14} color={highlighted ? theme.colors.onPrimary : trendColor} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    minHeight: 116,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 19,
    fontWeight: '800',
    marginVertical: 2,
  },
  additional: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insight: {
    fontSize: 11,
    fontWeight: '500',
  },
});
