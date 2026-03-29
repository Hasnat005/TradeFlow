import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency } from '../../features/invoices/utils';

type MetricCardProps = {
  title: string;
  amount: number;
  iconName: keyof typeof Ionicons.glyphMap;
  insight: string;
  additional?: string;
  trend?: 'up' | 'down';
  highlighted?: boolean;
};

export function MetricCard({ title, amount, iconName, insight, additional, trend, highlighted }: MetricCardProps) {
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
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: highlighted ? 'rgba(255,255,255,0.2)' : `${theme.colors.primary}14` }]}>
          <Ionicons name={iconName} size={16} color={highlighted ? theme.colors.onPrimary : theme.colors.primary} />
        </View>
        {trend ? <Ionicons name={trendIcon} size={14} color={highlighted ? theme.colors.onPrimary : trendColor} /> : null}
      </View>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 192,
    minHeight: 132,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 3,
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
    paddingRight: 8,
    flex: 1,
  },
});
