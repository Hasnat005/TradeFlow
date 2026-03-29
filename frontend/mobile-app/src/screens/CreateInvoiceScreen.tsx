import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/common/AppButton';
import { AppCard } from '../components/common/AppCard';
import { AppInput } from '../components/common/AppInput';
import { DateField, startOfToday } from '../components/common/DateField';
import { useCreateInvoiceMutation } from '../features/invoices/hooks/useInvoices';
import { InvoiceLineItem } from '../features/invoices/types';
import { calculateInvoiceTotal, formatCurrency } from '../features/invoices/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { InvoicesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<InvoicesStackParamList, 'CreateInvoice'>;

type EditableLineItem = {
  id: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
};

function createEditableLineItem(id: number): EditableLineItem {
  return {
    id: `new-li-${id}`,
    itemName: '',
    quantity: '1',
    unitPrice: '',
  };
}

export function CreateInvoiceScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const purchaseOrderRef = useRef<TextInput>(null);

  const [buyerName, setBuyerName] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<EditableLineItem[]>([createEditableLineItem(1)]);
  const [errorText, setErrorText] = useState<string | undefined>();

  const parsedLineItems: InvoiceLineItem[] = useMemo(
    () =>
      lineItems
        .filter((item) => item.itemName.trim().length > 0)
        .map((item) => ({
          id: item.id,
          itemName: item.itemName.trim(),
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
        }))
        .filter((item) => item.quantity > 0 && item.unitPrice > 0),
    [lineItems],
  );

  const totalAmount = useMemo(() => calculateInvoiceTotal(parsedLineItems), [parsedLineItems]);
  const today = useMemo(() => startOfToday(), []);
  const buyerNameError = useMemo(() => {
    if (!errorText) {
      return undefined;
    }

    if (errorText.includes('Buyer name')) {
      return 'Buyer name is required.';
    }

    return undefined;
  }, [errorText]);
  const dueDateError = useMemo(() => {
    if (!errorText || dueDate.trim().length === 0) {
      return undefined;
    }

    if (errorText.includes('Due date')) {
      return errorText;
    }

    return undefined;
  }, [dueDate, errorText]);

  const updateLineItem = (id: string, field: keyof EditableLineItem, value: string) => {
    setLineItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addLineItem = () => {
    setLineItems((previous) => [...previous, createEditableLineItem(previous.length + 1)]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((previous) => {
      if (previous.length === 1) {
        return previous;
      }
      return previous.filter((item) => item.id !== id);
    });
  };

  const submit = async (status: 'Draft' | 'Sent') => {
    const hasBuyerName = buyerName.trim().length > 1;

    if (!hasBuyerName || dueDate.trim().length === 0) {
      setErrorText('Buyer name and due date are required.');
      return;
    }

    const selectedDueDate = new Date(`${dueDate.trim()}T00:00:00`);
    if (Number.isNaN(selectedDueDate.getTime())) {
      setErrorText('Due date is invalid.');
      return;
    }

    if (selectedDueDate < today) {
      setErrorText('Due date cannot be earlier than today.');
      return;
    }

    if (parsedLineItems.length === 0) {
      setErrorText('Add at least one valid line item with quantity and unit price.');
      return;
    }

    setErrorText(undefined);

    try {
      const invoice = await createInvoiceMutation.mutateAsync({
        buyerName: buyerName.trim(),
        purchaseOrderId: purchaseOrderId.trim() || undefined,
        dueDate: dueDate.trim(),
        totalAmount,
        status,
        items: parsedLineItems,
      });

      navigation.replace('InvoiceDetail', { invoiceId: invoice.id });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to create invoice.');
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      <AppCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Invoice Information</Text>

        <AppInput
          label="Buyer Name"
          value={buyerName}
          onChangeText={setBuyerName}
          placeholder="Buyer name"
          returnKeyType="next"
          onSubmitEditing={() => purchaseOrderRef.current?.focus()}
          errorText={buyerNameError}
        />

        <AppInput
          ref={purchaseOrderRef}
          label="Purchase Order ID"
          value={purchaseOrderId}
          onChangeText={setPurchaseOrderId}
          placeholder="Purchase order ID (optional)"
          returnKeyType="done"
        />

        <DateField
          label="Due Date"
          value={dueDate}
          onChange={setDueDate}
          placeholder="Select date"
          minDate={today}
          errorText={dueDateError}
        />
      </AppCard>

      <AppCard>
        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Line Items</Text>
          <Pressable onPress={addLineItem} style={styles.smallButton}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>+ Add Item</Text>
          </Pressable>
        </View>

        {lineItems.map((item, index) => (
          <View key={item.id} style={[styles.lineItemCard, { borderColor: theme.colors.border }]}> 
            <View style={styles.rowBetween}>
              <Text style={[styles.itemLabel, { color: theme.colors.text }]}>Item {index + 1}</Text>
              <Pressable onPress={() => removeLineItem(item.id)}>
                <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>Remove</Text>
              </Pressable>
            </View>

            <TextInput
              value={item.itemName}
              onChangeText={(value) => updateLineItem(item.id, 'itemName', value)}
              placeholder="Item name"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />

            <View style={styles.rowGap}>
              <TextInput
                value={item.quantity}
                onChangeText={(value) => updateLineItem(item.id, 'quantity', value)}
                placeholder="Qty"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.muted}
                style={[styles.input, styles.halfInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
              />

              <TextInput
                value={item.unitPrice}
                onChangeText={(value) => updateLineItem(item.id, 'unitPrice', value)}
                placeholder="Unit price"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.muted}
                style={[styles.input, styles.halfInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
              />
            </View>
          </View>
        ))}

        <View style={styles.rowBetween}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total Amount</Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>{formatCurrency(totalAmount)}</Text>
        </View>
      </AppCard>

      {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}

      <View style={styles.submitRow}>
        <AppButton
          label="Save Draft"
          onPress={() => {
            void submit('Draft');
          }}
          disabled={createInvoiceMutation.isPending}
          variant="secondary"
        />

        <AppButton
          label="Create & Send"
          onPress={() => {
            void submit('Sent');
          }}
          disabled={createInvoiceMutation.isPending}
          loading={createInvoiceMutation.isPending}
        />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowGap: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  smallButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  lineItemCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  submitRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
