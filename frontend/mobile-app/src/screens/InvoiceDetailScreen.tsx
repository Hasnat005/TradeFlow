import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '../components/invoices/StatusBadge';
import { formatCurrency } from '../features/invoices/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { useInvoicesStore } from '../features/invoices/store/useInvoicesStore';
import { InvoicesStackParamList, MainTabParamList } from '../navigation/types';

type Props = NativeStackScreenProps<InvoicesStackParamList, 'InvoiceDetail'>;

export function InvoiceDetailScreen({ route }: Props) {
  const theme = useAppTheme();
  const mainTabNavigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { invoiceId } = route.params;

  const invoice = useInvoicesStore((state) =>
    state.invoices.find((entry) => entry.id === invoiceId),
  );
  const markAsPaid = useInvoicesStore((state) => state.markAsPaid);

  if (!invoice) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.fallbackTitle, { color: theme.colors.text }]}>Invoice not found</Text>
      </View>
    );
  }

  const timeline = [
    { title: 'Invoice Created', date: invoice.createdAt, done: true },
    {
      title: 'Financing Requested',
      date: invoice.financingStatus === 'Not Requested' ? '--' : invoice.createdAt,
      done: invoice.financingStatus !== 'Not Requested',
    },
    {
      title: invoice.status === 'Paid' ? 'Invoice Paid' : 'Payment Pending',
      date: invoice.status === 'Paid' ? new Date().toISOString().slice(0, 10) : invoice.dueDate,
      done: invoice.status === 'Paid',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            ...theme.shadow,
          },
        ]}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.invoiceId, { color: theme.colors.text }]}>{invoice.id}</Text>
          <StatusBadge status={invoice.status} />
        </View>

        <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatCurrency(invoice.amount)}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Due {invoice.dueDate}</Text>

        <View style={styles.metaSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Buyer Information</Text>
          <Text style={[styles.meta, { color: theme.colors.text }]}>{invoice.buyerCompany}</Text>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>{invoice.buyerEmail}</Text>
        </View>

        <View style={styles.metaSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Financing Status</Text>
          <Text style={[styles.financingText, { color: theme.colors.info }]}>{invoice.financingStatus}</Text>
        </View>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Line Items</Text>
        {invoice.lineItems.map((item) => (
          <View key={item.id} style={styles.rowBetween}>
            <Text style={[styles.meta, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.meta, { color: theme.colors.muted }]}>
              {item.quantity} × {formatCurrency(item.unitPrice)}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Timeline</Text>
        {timeline.map((event) => (
          <View key={event.title} style={styles.timelineRow}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: event.done ? theme.colors.primary : theme.colors.border },
              ]}
            />
            <View style={styles.timelineTextWrap}>
              <Text style={[styles.meta, { color: theme.colors.text }]}>{event.title}</Text>
              <Text style={[styles.timelineDate, { color: theme.colors.muted }]}>{event.date}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionGroup}>
        <Pressable
          onPress={() =>
            mainTabNavigation.navigate('Financing', {
              screen: 'FinancingRequest',
              params: { invoiceId: invoice.id },
            })
          }
          style={({ pressed }) => [
            styles.primaryAction,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Request Financing</Text>
        </Pressable>

        <Pressable
          onPress={() => markAsPaid(invoice.id)}
          style={({ pressed }) => [
            styles.secondaryAction,
            {
              borderColor: theme.colors.success,
              backgroundColor: pressed ? `${theme.colors.success}1A` : 'transparent',
            },
          ]}
        >
          <Text style={[styles.secondaryActionText, { color: theme.colors.success }]}>Mark as Paid</Text>
        </Pressable>

        <Pressable
          onPress={() => Alert.alert('Download Invoice', 'Invoice PDF generation can be connected to backend API.')}
          style={({ pressed }) => [
            styles.secondaryAction,
            {
              borderColor: theme.colors.border,
              backgroundColor: pressed ? `${theme.colors.primary}12` : 'transparent',
            },
          ]}
        >
          <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>Download Invoice</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  invoiceId: {
    fontSize: 13,
    fontWeight: '700',
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
  },
  metaSection: {
    gap: 3,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  financingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  timelineTextWrap: {
    flex: 1,
    paddingVertical: 4,
  },
  timelineDate: {
    fontSize: 12,
    marginTop: 2,
  },
  actionGroup: {
    gap: 10,
    marginTop: 4,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryAction: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
