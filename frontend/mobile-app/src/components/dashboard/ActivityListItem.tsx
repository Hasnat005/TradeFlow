import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ActivityStatus = 'pending' | 'approved' | 'completed';

type ActivityListItemProps = {
  title: string;
  timestamp: string;
  amount: string;
  status: ActivityStatus;
};

export function ActivityListItem({ title, timestamp, amount, status }: ActivityListItemProps) {
  const theme = useAppTheme();

  const statusColor =
    status === 'pending'
      ? theme.colors.warning
      : status === 'approved'
        ? theme.colors.info
        : theme.colors.success;

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}> 
      <View style={styles.leftContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.time, { color: theme.colors.muted }]}>{timestamp}</Text>
      </View>

      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: theme.colors.text }]}>{amount}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
