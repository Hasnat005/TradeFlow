import { StyleSheet, Text, View } from 'react-native';

import { InvoiceLineItem } from '../../features/invoices/types';
import { formatCurrency } from '../../features/invoices/utils';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  item: InvoiceLineItem;
};

export function InvoiceItemRow({ item }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.itemName}</Text>
      <Text style={[styles.meta, { color: theme.colors.muted }]}>{item.quantity}</Text>
      <Text style={[styles.meta, { color: theme.colors.muted }]}>{formatCurrency(item.unitPrice)}</Text>
      <Text style={[styles.total, { color: theme.colors.text }]}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
  },
  itemName: {
    flex: 1.8,
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    flex: 0.8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  total: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});
