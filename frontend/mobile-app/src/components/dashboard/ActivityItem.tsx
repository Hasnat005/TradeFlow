import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ActivityStatus = 'pending' | 'approved' | 'completed';

type ActivityItemProps = {
  title: string;
  description: string;
  timestamp: string;
  status: ActivityStatus;
};

export function ActivityItem({ title, description, timestamp, status }: ActivityItemProps) {
  const theme = useAppTheme();

  const statusColor =
    status === 'pending'
      ? theme.colors.warning
      : status === 'approved'
        ? theme.colors.info
        : theme.colors.success;

  return (
    <View style={[styles.item, { borderBottomColor: theme.colors.border }]}> 
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.muted }]}>{description}</Text>
        <Text style={[styles.time, { color: theme.colors.muted }]}>{timestamp}</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
        <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    paddingRight: 12,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
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
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
