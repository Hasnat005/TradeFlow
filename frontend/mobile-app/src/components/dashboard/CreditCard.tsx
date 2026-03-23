import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency } from '../../features/invoices/utils';

type Props = {
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  usedPercent: number;
};

export function CreditCard({ creditLimit, usedCredit, availableCredit, usedPercent }: Props) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <Text style={[styles.title, { color: theme.colors.text }]}>Credit Insights</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Credit Limit</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{formatCurrency(creditLimit)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Used Credit</Text>
        <Text style={[styles.value, { color: theme.colors.warning }]}>{formatCurrency(usedCredit)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Available Credit</Text>
        <Text style={[styles.value, { color: theme.colors.success }]}>{formatCurrency(availableCredit)}</Text>
      </View>

      <View style={[styles.track, { backgroundColor: `${theme.colors.primary}1A` }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, usedPercent))}%`,
              backgroundColor: usedPercent >= 85 ? theme.colors.danger : theme.colors.primary,
            },
          ]}
        />
      </View>
      <Text style={[styles.percent, { color: theme.colors.muted }]}>{usedPercent}% used</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    marginTop: 2,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 999,
  },
  percent: {
    fontSize: 11,
    fontWeight: '600',
  },
});
