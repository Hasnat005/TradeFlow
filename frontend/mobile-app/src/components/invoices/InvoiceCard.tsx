import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Invoice } from '../../features/invoices/types';
import { formatCurrency } from '../../features/invoices/utils';
import { useAppTheme } from '../../hooks/useAppTheme';
import { StatusBadge } from './StatusBadge';

type InvoiceCardProps = {
  invoice: Invoice;
  onPress: () => void;
};

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
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
        <Text style={[styles.invoiceId, { color: theme.colors.text }]}>{invoice.id}</Text>
        <StatusBadge status={invoice.status} />
      </View>

      <Text style={[styles.buyerName, { color: theme.colors.text }]}>{invoice.buyerName}</Text>

      <View style={styles.rowBetween}>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatCurrency(invoice.totalAmount)}</Text>
        <Text style={[styles.dueDate, { color: theme.colors.muted }]}>Due {invoice.dueDate}</Text>
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
  },
  invoiceId: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buyerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
});
