import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '../components/invoices/EmptyState';
import { InvoiceItemRow } from '../components/invoices/InvoiceItemRow';
import { StatusBadge } from '../components/invoices/StatusBadge';
import { TimelineStep } from '../components/invoices/TimelineStep';
import { useInvoiceDetailQuery, useUpdateInvoiceStatusMutation } from '../features/invoices/hooks/useInvoices';
import { InvoiceStatus } from '../features/invoices/types';
import { formatCurrency } from '../features/invoices/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { InvoicesStackParamList, MainTabParamList } from '../navigation/types';

type Props = NativeStackScreenProps<InvoicesStackParamList, 'InvoiceDetail'>;

const WORKFLOW: InvoiceStatus[] = ['Draft', 'Sent', 'Financed', 'Paid'];

export function InvoiceDetailScreen({ route }: Props) {
  const theme = useAppTheme();
  const mainTabNavigation = useNavigation<NavigationProp<MainTabParamList>>();
  const [actionError, setActionError] = useState<string | undefined>();
  const [paymentAmountInput, setPaymentAmountInput] = useState('');

  const { data: invoice, isLoading, isError, refetch } = useInvoiceDetailQuery(route.params.invoiceId);
  const updateStatusMutation = useUpdateInvoiceStatusMutation(route.params.invoiceId);

  if (isLoading) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.fallbackTitle, { color: theme.colors.text }]}>Loading invoice...</Text>
      </View>
    );
  }

  if (isError || !invoice) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          title="Invoice unavailable"
          message="We couldn't load this invoice."
          actionLabel="Retry"
          onAction={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  const timelineMap = new Map(invoice.timeline.map((entry) => [entry.status, entry.timestamp]));
  const outstandingAmount = Math.max(invoice.totalAmount - invoice.paidAmount, 0);

  const onUpdateStatus = async (status: InvoiceStatus, paymentAmount?: number) => {
    setActionError(undefined);

    try {
      await updateStatusMutation.mutateAsync({ status, paymentAmount });
      if (status === 'Paid') {
        setPaymentAmountInput('');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update invoice status.');
    }
  };

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

        <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatCurrency(invoice.totalAmount)}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Issued {invoice.issueDate}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Due {invoice.dueDate}</Text>

        <View style={styles.metaSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Buyer Information</Text>
          <Text style={[styles.meta, { color: theme.colors.text }]}>{invoice.buyerName}</Text>
          {invoice.poNumber ? <Text style={[styles.meta, { color: theme.colors.muted }]}>PO {invoice.poNumber}</Text> : null}
        </View>

        <View style={styles.metaSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Summary</Text>
          <Text style={[styles.meta, { color: theme.colors.text }]}>Paid: {formatCurrency(invoice.paidAmount)}</Text>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>Outstanding: {formatCurrency(outstandingAmount)}</Text>
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
        <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}> 
          <Text style={[styles.tableHeaderText, styles.flexName, { color: theme.colors.muted }]}>Item</Text>
          <Text style={[styles.tableHeaderText, styles.flexMeta, { color: theme.colors.muted }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.flexMeta, { color: theme.colors.muted }]}>Price</Text>
          <Text style={[styles.tableHeaderText, styles.flexTotal, { color: theme.colors.muted }]}>Total</Text>
        </View>

        {invoice.lineItems.map((item) => (
          <InvoiceItemRow key={item.id} item={item} />
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
        {WORKFLOW.map((status, index) => (
          <TimelineStep
            key={status}
            label={status}
            done={invoice.timeline.some((entry) => entry.status === status && entry.completed)}
            timestamp={timelineMap.get(status)}
            last={index === WORKFLOW.length - 1}
          />
        ))}
        {invoice.status === 'Overdue' ? <TimelineStep label="Overdue" done timestamp={invoice.updatedAt} last /> : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Record Payment</Text>
        <TextInput
          value={paymentAmountInput}
          onChangeText={setPaymentAmountInput}
          keyboardType="decimal-pad"
          placeholder="Payment amount"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        />
        <Pressable
          onPress={() => {
            const parsedAmount = Number(paymentAmountInput);
            if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
              setActionError('Enter a valid payment amount greater than zero.');
              return;
            }
            void onUpdateStatus('Paid', parsedAmount);
          }}
          disabled={updateStatusMutation.isPending}
          style={({ pressed }) => [
            styles.secondaryAction,
            {
              borderColor: theme.colors.success,
              backgroundColor: pressed ? `${theme.colors.success}1A` : 'transparent',
              opacity: updateStatusMutation.isPending ? 0.6 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryActionText, { color: theme.colors.success }]}>Record Payment</Text>
        </Pressable>
      </View>

      <View style={styles.actionGroup}>
        {invoice.status === 'Draft' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Sent');
            }}
            disabled={updateStatusMutation.isPending}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.info,
                backgroundColor: pressed ? `${theme.colors.info}1A` : 'transparent',
                opacity: updateStatusMutation.isPending ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.info }]}>Send Invoice</Text>
          </Pressable>
        ) : null}

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

        {invoice.status !== 'Paid' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Paid', outstandingAmount > 0 ? outstandingAmount : undefined);
            }}
            disabled={updateStatusMutation.isPending}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.success,
                backgroundColor: pressed ? `${theme.colors.success}1A` : 'transparent',
                opacity: updateStatusMutation.isPending ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.success }]}>Mark as Paid</Text>
          </Pressable>
        ) : null}

        {actionError ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{actionError}</Text> : null}
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
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flexName: {
    flex: 1.8,
  },
  flexMeta: {
    flex: 0.8,
    textAlign: 'right',
  },
  flexTotal: {
    flex: 1,
    textAlign: 'right',
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
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
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 4,
  },
});
