import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PurchaseOrder } from '../../features/orders/types';
import { formatCurrency } from '../../features/orders/utils';
import { useAppTheme } from '../../hooks/useAppTheme';
import { StatusBadge } from './StatusBadge';

type Props = {
  order: PurchaseOrder;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.96 : 1,
          ...theme.shadow,
        },
      ]}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.poNumber, { color: theme.colors.text }]}>{order.poNumber}</Text>
        <StatusBadge status={order.status} />
      </View>

      <Text style={[styles.supplierName, { color: theme.colors.text }]}>{order.supplierName}</Text>

      <View style={styles.rowBetween}>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatCurrency(order.totalAmount)}</Text>
        <Text style={[styles.date, { color: theme.colors.muted }]}>{order.orderDate}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  poNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
});
