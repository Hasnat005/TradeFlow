import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FinancingRequest } from '../../features/financing/types';
import { formatCurrency } from '../../features/financing/utils';
import { useAppTheme } from '../../hooks/useAppTheme';
import { StatusBadge } from './StatusBadge';

type Props = {
  item: FinancingRequest;
  onPress: () => void;
};

export function FinancingCard({ item, onPress }: Props) {
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
        <Text style={[styles.invoiceId, { color: theme.colors.text }]}>Invoice {item.invoiceId}</Text>
        <StatusBadge status={item.status} />
      </View>

      <Text style={[styles.buyerName, { color: theme.colors.text }]}>{item.buyerName}</Text>

      <View style={styles.rowBetween}>
        <View>
          <Text style={[styles.amountLabel, { color: theme.colors.muted }]}>Requested</Text>
          <Text style={[styles.amountValue, { color: theme.colors.primary }]}>{formatCurrency(item.requestedAmount)}</Text>
        </View>
        <View>
          <Text style={[styles.amountLabel, { color: theme.colors.muted }]}>Approved</Text>
          <Text style={[styles.amountValue, { color: theme.colors.text }]}>
            {item.approvedAmount ? formatCurrency(item.approvedAmount) : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <Text style={[styles.metaText, { color: theme.colors.muted }]}>
          Rate {item.interestRate ? `${item.interestRate}%` : '--'}
        </Text>
        <Text style={[styles.metaText, { color: theme.colors.muted }]}>{item.id}</Text>
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
  invoiceId: {
    fontSize: 13,
    fontWeight: '700',
  },
  buyerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
