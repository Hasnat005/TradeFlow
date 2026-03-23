import { StyleSheet, Text, View } from 'react-native';

import { PurchaseOrderStatus } from '../../features/orders/types';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  status: PurchaseOrderStatus;
};

export function StatusBadge({ status }: Props) {
  const theme = useAppTheme();

  const colorByStatus: Record<PurchaseOrderStatus, string> = {
    Draft: theme.colors.muted,
    Sent: theme.colors.primary,
    Accepted: theme.colors.info,
    Rejected: theme.colors.danger,
    Delivered: theme.colors.info,
    Completed: theme.colors.success,
  };

  const color = colorByStatus[status];

  return (
    <View style={[styles.badge, { borderColor: `${color}40`, backgroundColor: `${color}16` }]}>
      <Text style={[styles.label, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
