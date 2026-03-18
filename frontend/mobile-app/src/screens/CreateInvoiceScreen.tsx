import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { InvoiceLineItem } from '../features/invoices/types';
import { calculateInvoiceTotal, formatCurrency } from '../features/invoices/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { useInvoicesStore } from '../features/invoices/store/useInvoicesStore';
import { InvoicesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<InvoicesStackParamList, 'CreateInvoice'>;

type EditableLineItem = {
  id: string;
  title: string;
  quantity: string;
  unitPrice: string;
};

function createEditableLineItem(id: number): EditableLineItem {
  return {
    id: `new-li-${id}`,
    title: '',
    quantity: '1',
    unitPrice: '',
  };
}

export function CreateInvoiceScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const createInvoice = useInvoicesStore((state) => state.createInvoice);

  const [buyerName, setBuyerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<EditableLineItem[]>([createEditableLineItem(1)]);
  const [errorText, setErrorText] = useState<string | undefined>();

  const parsedLineItems: InvoiceLineItem[] = useMemo(
    () =>
      lineItems
        .filter((item) => item.title.trim().length > 0)
        .map((item) => ({
          id: item.id,
          title: item.title.trim(),
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
        }))
        .filter((item) => item.quantity > 0 && item.unitPrice > 0),
    [lineItems],
  );

  const totalAmount = useMemo(() => calculateInvoiceTotal(parsedLineItems), [parsedLineItems]);

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

  const submit = () => {
    const hasBasicInfo = buyerName.trim().length > 1 && dueDate.trim().length > 0;

    if (!hasBasicInfo) {
      setErrorText('Buyer name and due date are required.');
      return;
    }

    if (parsedLineItems.length === 0) {
      setErrorText('Add at least one valid line item with quantity and unit price.');
      return;
    }

    setErrorText(undefined);

    const invoiceId = createInvoice({
      buyerName: buyerName.trim(),
      dueDate: dueDate.trim(),
      description: description.trim() || 'No description provided',
      lineItems: parsedLineItems,
    });

    navigation.replace('InvoiceDetail', { invoiceId });
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
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Invoice Information</Text>

        <TextInput
          value={buyerName}
          onChangeText={setBuyerName}
          placeholder="Buyer name"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        />

        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="Due date (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          placeholderTextColor={theme.colors.muted}
          style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
        />
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
              value={item.title}
              onChangeText={(value) => updateLineItem(item.id, 'title', value)}
              placeholder="Item title"
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
      </View>

      {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}

      <Pressable
        onPress={submit}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <Text style={[styles.submitButtonText, { color: theme.colors.onPrimary }]}>Create Invoice</Text>
      </Pressable>
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
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
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
  textArea: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
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
  submitButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
