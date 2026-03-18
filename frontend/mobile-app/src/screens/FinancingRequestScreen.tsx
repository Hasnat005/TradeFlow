import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFinancingStore } from '../features/financing/store/useFinancingStore';
import { calculateEstimatedInterest, calculateRepayment, formatCurrency } from '../features/financing/utils';
import { useInvoicesStore } from '../features/invoices/store/useInvoicesStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { FinancingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<FinancingStackParamList, 'FinancingRequest'>;

export function FinancingRequestScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const invoices = useInvoicesStore((state) => state.invoices);
  const requestFinancing = useFinancingStore((state) => state.requestFinancing);

  const defaultInvoiceId = route.params?.invoiceId;
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId ?? invoices[0]?.id ?? '');
  const [requestedAmountText, setRequestedAmountText] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>();

  const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceId);

  const requestedAmount = Number(requestedAmountText || '0');
  const estimatedInterest = useMemo(() => calculateEstimatedInterest(requestedAmount, 2.8), [requestedAmount]);
  const repaymentAmount = useMemo(() => calculateRepayment(requestedAmount, 2.8), [requestedAmount]);

  const submit = () => {
    if (!selectedInvoice) {
      setErrorText('Select an invoice to continue.');
      return;
    }

    if (!requestedAmount || requestedAmount <= 0) {
      setErrorText('Requested amount is required.');
      return;
    }

    if (requestedAmount > selectedInvoice.amount) {
      setErrorText('Requested amount cannot exceed invoice value.');
      return;
    }

    setErrorText(undefined);

    const created = requestFinancing({
      invoiceId: selectedInvoice.id,
      requestedAmount,
    });

    navigation.replace('FinancingDetail', { requestId: created.id });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Invoice</Text>
        {invoices.map((invoice) => {
          const selected = invoice.id === invoiceId;
          return (
            <Pressable
              key={invoice.id}
              onPress={() => setInvoiceId(invoice.id)}
              style={[
                styles.invoiceOption,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? `${theme.colors.primary}12` : theme.colors.surface,
                },
              ]}
            >
              <Text style={[styles.invoiceOptionId, { color: theme.colors.text }]}>{invoice.id}</Text>
              <Text style={[styles.invoiceOptionMeta, { color: theme.colors.muted }]}>
                {invoice.buyerName} · {formatCurrency(invoice.amount)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Request Terms</Text>

        <Text style={[styles.inputLabel, { color: theme.colors.muted }]}>Requested Amount</Text>
        <TextInput
          value={requestedAmountText}
          onChangeText={setRequestedAmountText}
          keyboardType="decimal-pad"
          placeholder="Enter amount"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        />

        <View style={styles.rowBetween}>
          <Text style={[styles.calcLabel, { color: theme.colors.muted }]}>Estimated Interest (2.8%)</Text>
          <Text style={[styles.calcValue, { color: theme.colors.text }]}>{formatCurrency(estimatedInterest)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.calcLabel, { color: theme.colors.muted }]}>Repayment Amount</Text>
          <Text style={[styles.calcValue, { color: theme.colors.primary }]}>{formatCurrency(repaymentAmount)}</Text>
        </View>

        {selectedInvoice ? (
          <Text style={[styles.hint, { color: theme.colors.muted }]}>Invoice value: {formatCurrency(selectedInvoice.amount)}</Text>
        ) : null}

        {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}

        <Pressable
          onPress={submit}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <Text style={[styles.submitButtonText, { color: theme.colors.onPrimary }]}>Submit Request</Text>
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
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  invoiceOption: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  invoiceOptionId: {
    fontSize: 13,
    fontWeight: '700',
  },
  invoiceOptionMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
