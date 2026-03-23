import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency } from '../../features/invoices/utils';

type ActivityStatus = 'success' | 'warning' | 'danger' | 'info';

type ActivityItemProps = {
  title: string;
  description: string;
  timestamp: string;
  status: ActivityStatus;
  amount?: number;
};

export function ActivityItem({ title, description, timestamp, status, amount }: ActivityItemProps) {
  const theme = useAppTheme();

  const statusColor =
    status === 'warning'
      ? theme.colors.warning
      : status === 'danger'
        ? theme.colors.danger
        : status === 'success'
          ? theme.colors.success
          : theme.colors.info;

  return (
    <View style={[styles.item, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.muted }]}>{description}</Text>
        <Text style={[styles.time, { color: theme.colors.muted }]}>{timestamp}</Text>
      </View>

      <View style={styles.rightWrap}>
        {amount !== undefined ? (
          <Text style={[styles.amount, { color: theme.colors.text }]}>{formatCurrency(amount)}</Text>
        ) : null}

        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    paddingRight: 12,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 11,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rightWrap: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
