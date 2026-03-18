import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { InvoiceStatus } from '../../features/invoices/types';

type StatusBadgeProps = {
  status: InvoiceStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useAppTheme();

  const statusColorMap: Record<InvoiceStatus, string> = {
    Pending: theme.colors.warning,
    Paid: theme.colors.success,
    Overdue: theme.colors.danger,
    Financed: theme.colors.info,
  };

  const color = statusColorMap[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
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
