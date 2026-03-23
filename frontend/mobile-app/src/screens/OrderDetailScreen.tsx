import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OrdersEmptyState } from '../components/orders/OrdersEmptyState';
import { OrderItemRow } from '../components/orders/OrderItemRow';
import { StatusBadge } from '../components/orders/StatusBadge';
import { TimelineStep } from '../components/orders/TimelineStep';
import {
  useConvertOrderToInvoiceMutation,
  useOrderDetailQuery,
  useUpdateOrderStatusMutation,
} from '../features/orders/hooks/useOrders';
import { PurchaseOrderStatus } from '../features/orders/types';
import { formatCurrency } from '../features/orders/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { MainTabParamList, OrdersStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;

const WORKFLOW: PurchaseOrderStatus[] = ['Draft', 'Sent', 'Accepted', 'Delivered', 'Completed'];

export function OrderDetailScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const mainTabNavigation = useNavigation<NavigationProp<MainTabParamList>>();
  const [actionError, setActionError] = useState<string | undefined>();

  const { data: order, isLoading, isError, refetch } = useOrderDetailQuery(route.params.orderId);
  const updateStatusMutation = useUpdateOrderStatusMutation(route.params.orderId);
  const convertToInvoiceMutation = useConvertOrderToInvoiceMutation(route.params.orderId);

  if (isLoading) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.fallbackText, { color: theme.colors.text }]}>Loading order...</Text>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}> 
        <OrdersEmptyState
          title="Order unavailable"
          message="We couldn't load this purchase order."
          actionLabel="Retry"
          onAction={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  const timelineMap = new Map(order.timeline.map((entry) => [entry.status, entry.timestamp]));

  const onUpdateStatus = async (status: PurchaseOrderStatus) => {
    setActionError(undefined);
    try {
      await updateStatusMutation.mutateAsync(status);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update order status.');
    }
  };

  const onConvertToInvoice = async () => {
    setActionError(undefined);
    try {
      const data = await convertToInvoiceMutation.mutateAsync();
      mainTabNavigation.navigate('Invoices', {
        screen: 'InvoiceDetail',
        params: { invoiceId: data.invoiceId },
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to convert order to invoice.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, ...theme.shadow }]}> 
        <View style={styles.rowBetween}>
          <Text style={[styles.poNumber, { color: theme.colors.text }]}>{order.poNumber}</Text>
          <StatusBadge status={order.status} />
        </View>

        <Text style={[styles.meta, { color: theme.colors.text }]}>Supplier: {order.supplierName}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Order date: {order.orderDate}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Expected delivery: {order.expectedDeliveryDate}</Text>
        <Text style={[styles.total, { color: theme.colors.primary }]}>{formatCurrency(order.totalAmount)}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}> 
          <Text style={[styles.tableHeaderText, styles.flexName, { color: theme.colors.muted }]}>Item</Text>
          <Text style={[styles.tableHeaderText, styles.flexMeta, { color: theme.colors.muted }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.flexMeta, { color: theme.colors.muted }]}>Price</Text>
          <Text style={[styles.tableHeaderText, styles.flexTotal, { color: theme.colors.muted }]}>Total</Text>
        </View>

        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Workflow Timeline</Text>
        {WORKFLOW.map((status, index) => (
          <TimelineStep
            key={status}
            label={status}
            done={order.timeline.some((entry) => entry.status === status)}
            timestamp={timelineMap.get(status)}
            last={index === WORKFLOW.length - 1}
          />
        ))}
      </View>

      <View style={styles.actionsWrap}>
        {order.status === 'Draft' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Sent');
            }}
            style={({ pressed }) => [
              styles.primaryAction,
              { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Send Order</Text>
          </Pressable>
        ) : null}

        {order.status === 'Draft' ? (
          <Pressable
            onPress={() =>
              navigation.navigate('CreatePurchaseOrder', {
                orderId: order.id,
                initialValues: {
                  supplierName: order.supplierName,
                  expectedDeliveryDate: order.expectedDeliveryDate,
                  notes: order.notes,
                  status: order.status,
                  items: order.items,
                },
              })
            }
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.border,
                backgroundColor: pressed ? `${theme.colors.primary}12` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>Edit Order</Text>
          </Pressable>
        ) : null}

        {order.status === 'Accepted' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Delivered');
            }}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.info,
                backgroundColor: pressed ? `${theme.colors.info}12` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.info }]}>Mark as Delivered</Text>
          </Pressable>
        ) : null}

        {order.status === 'Delivered' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Completed');
            }}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.success,
                backgroundColor: pressed ? `${theme.colors.success}12` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.success }]}>Complete Order</Text>
          </Pressable>
        ) : null}

        {(order.status === 'Draft' || order.status === 'Sent') ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Rejected');
            }}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.danger,
                backgroundColor: pressed ? `${theme.colors.danger}12` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.danger }]}>Cancel Order</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            void onConvertToInvoice();
          }}
          style={({ pressed }) => [
            styles.primaryAction,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Convert to Invoice</Text>
        </Pressable>

        {actionError ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{actionError}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  poNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  total: {
    fontSize: 24,
    fontWeight: '800',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsWrap: {
    gap: 10,
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
  },
});
