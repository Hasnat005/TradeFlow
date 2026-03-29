import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/common/AppButton';
import { AppCard } from '../components/common/AppCard';
import { AppInput } from '../components/common/AppInput';
import { DateField, startOfToday } from '../components/common/DateField';
import { PurchaseOrderItem } from '../features/orders/types';
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
} from '../features/orders/hooks/useOrders';
import { calculateOrderTotal, formatCurrency } from '../features/orders/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { OrdersStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OrdersStackParamList, 'CreatePurchaseOrder'>;

type EditableItem = {
  id: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
};

function createEditableItem(index: number): EditableItem {
  return {
    id: `item-${index}`,
    itemName: '',
    quantity: '1',
    unitPrice: '',
  };
}

export function CreatePurchaseOrderScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const editOrderId = route.params?.orderId;
  const initialValues = route.params?.initialValues;
  const notesRef = useRef<TextInput>(null);

  const createOrderMutation = useCreateOrderMutation();
  const updateOrderMutation = useUpdateOrderMutation(editOrderId ?? '');
  const updateOrderStatusMutation = useUpdateOrderStatusMutation(editOrderId ?? '');

  const [supplierName, setSupplierName] = useState(initialValues?.supplierName ?? '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(initialValues?.expectedDeliveryDate ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [items, setItems] = useState<EditableItem[]>(
    initialValues?.items?.length
      ? initialValues.items.map((item, index) => ({
          id: item.id || `item-${index + 1}`,
          itemName: item.itemName,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
        }))
      : [createEditableItem(1)],
  );
  const [errorText, setErrorText] = useState<string | undefined>();

  const parsedItems: PurchaseOrderItem[] = useMemo(
    () =>
      items
        .filter((item) => item.itemName.trim().length > 0)
        .map((item) => ({
          id: item.id,
          itemName: item.itemName.trim(),
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
        }))
        .filter((item) => item.quantity > 0 && item.unitPrice > 0),
    [items],
  );

  const total = useMemo(() => calculateOrderTotal(parsedItems), [parsedItems]);
  const [today, setToday] = useState(() => startOfToday());
  const supplierError = useMemo(() => {
    if (!errorText) {
      return undefined;
    }

    if (errorText.includes('Supplier name')) {
      return 'Supplier name is required.';
    }

    return undefined;
  }, [errorText]);
  const expectedDateError = useMemo(() => {
    if (!errorText || expectedDeliveryDate.trim().length === 0) {
      return undefined;
    }

    if (errorText.includes('delivery date')) {
      return errorText;
    }

    return undefined;
  }, [errorText, expectedDeliveryDate]);

  useFocusEffect(
    useCallback(() => {
      setToday(startOfToday());
    }, []),
  );

  const updateItem = (id: string, field: keyof EditableItem, value: string) => {
    setItems((previous) => previous.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((previous) => [...previous, createEditableItem(previous.length + 1)]);
  };

  const removeItem = (id: string) => {
    setItems((previous) => (previous.length > 1 ? previous.filter((item) => item.id !== id) : previous));
  };

  const submit = async (submitOrder: boolean) => {
    if (editOrderId && initialValues?.status && initialValues.status !== 'Draft') {
      setErrorText('Only Draft orders can be edited.');
      return;
    }

    if (supplierName.trim().length < 2 || expectedDeliveryDate.trim().length === 0) {
      setErrorText('Supplier name and expected delivery date are required.');
      return;
    }

    const selectedDeliveryDate = new Date(`${expectedDeliveryDate.trim()}T00:00:00`);
    if (Number.isNaN(selectedDeliveryDate.getTime())) {
      setErrorText('Expected delivery date is invalid.');
      return;
    }

    if (selectedDeliveryDate < today) {
      setErrorText('Expected delivery date cannot be earlier than today.');
      return;
    }

    if (parsedItems.length === 0) {
      setErrorText('Add at least one valid order item.');
      return;
    }

    setErrorText(undefined);

    try {
      if (editOrderId) {
        await updateOrderMutation.mutateAsync({
          supplier_name: supplierName.trim(),
          expected_delivery_date: expectedDeliveryDate.trim(),
          notes: notes.trim() || undefined,
          items: parsedItems.map((item) => ({
            item_name: item.itemName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          })),
        });

        if (submitOrder) {
          await updateOrderStatusMutation.mutateAsync('Sent');
        }

        navigation.replace('OrderDetail', { orderId: editOrderId });
        return;
      }

      const created = await createOrderMutation.mutateAsync({
        supplier_name: supplierName.trim(),
        expected_delivery_date: expectedDeliveryDate.trim(),
        notes: notes.trim() || undefined,
        status: submitOrder ? 'Sent' : 'Draft',
        items: parsedItems.map((item) => ({
          item_name: item.itemName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      });

      navigation.replace('OrderDetail', { orderId: created.id });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to save order. Please try again.');
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Purchase Order Details</Text>

        <AppInput
          label="Supplier / Vendor Name"
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="Supplier / Vendor name"
          returnKeyType="next"
          onSubmitEditing={() => notesRef.current?.focus()}
          errorText={supplierError}
        />

        <DateField
          label="Expected Delivery Date"
          value={expectedDeliveryDate}
          onChange={setExpectedDeliveryDate}
          placeholder="Select date"
          minDate={today}
          errorText={expectedDateError}
        />

        <AppInput
          ref={notesRef}
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
          multiline
          returnKeyType="default"
          style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
        />
      </AppCard>

      <AppCard>
        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Items</Text>
          <Pressable onPress={addItem} style={styles.inlineButton}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>+ Add Item</Text>
          </Pressable>
        </View>

        {items.map((item, index) => (
          <View key={item.id} style={[styles.itemCard, { borderColor: theme.colors.border }]}> 
            <View style={styles.rowBetween}>
              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>Item {index + 1}</Text>
              <Pressable onPress={() => removeItem(item.id)}>
                <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>Remove</Text>
              </Pressable>
            </View>

            <TextInput
              value={item.itemName}
              onChangeText={(value) => updateItem(item.id, 'itemName', value)}
              placeholder="Item name"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />

            <View style={styles.rowGap}>
              <TextInput
                value={item.quantity}
                onChangeText={(value) => updateItem(item.id, 'quantity', value)}
                placeholder="Qty"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.muted}
                style={[styles.input, styles.halfInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
              />
              <TextInput
                value={item.unitPrice}
                onChangeText={(value) => updateItem(item.id, 'unitPrice', value)}
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
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>{formatCurrency(total)}</Text>
        </View>
      </AppCard>

      {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}

      <View style={styles.actionsWrap}>
        <AppButton
          label="Save as Draft"
          onPress={() => {
            void submit(false);
          }}
          disabled={createOrderMutation.isPending || updateOrderMutation.isPending || updateOrderStatusMutation.isPending}
          variant="secondary"
        />

        <AppButton
          label="Submit Order"
          onPress={() => {
            void submit(true);
          }}
          disabled={createOrderMutation.isPending || updateOrderMutation.isPending || updateOrderStatusMutation.isPending}
          loading={createOrderMutation.isPending || updateOrderMutation.isPending || updateOrderStatusMutation.isPending}
        />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  inlineButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
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
  actionsWrap: {
    gap: 10,
  },
});
