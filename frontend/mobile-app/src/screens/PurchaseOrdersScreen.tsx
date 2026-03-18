import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { OrderCard } from '../components/orders/OrderCard';
import { SummaryCard } from '../components/orders/SummaryCard';
import { OrdersDateRange, OrdersStatusFilter } from '../features/orders/types';
import { useOrdersStore } from '../features/orders/store/useOrdersStore';
import { formatCurrency, normalizeDate } from '../features/orders/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { OrdersStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersDashboard'>;

const STATUS_OPTIONS: OrdersStatusFilter[] = ['All', 'Draft', 'Sent', 'Completed'];

export function PurchaseOrdersScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const orders = useOrdersStore((state) => state.orders);

  const [statusFilter, setStatusFilter] = useState<OrdersStatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<OrdersDateRange>({});

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const from = dateRange.from ? normalizeDate(dateRange.from) : undefined;
    const to = dateRange.to ? normalizeDate(dateRange.to) : undefined;

    return orders.filter((order) => {
      const statusMatch = statusFilter === 'All' ? true : order.status === statusFilter;
      const searchMatch =
        query.length === 0 ||
        order.poNumber.toLowerCase().includes(query) ||
        order.supplierName.toLowerCase().includes(query);
      const orderDate = normalizeDate(order.orderDate);
      const fromMatch = from && orderDate ? orderDate >= from : true;
      const toMatch = to && orderDate ? orderDate <= to : true;

      return statusMatch && searchMatch && fromMatch && toMatch;
    });
  }, [dateRange.from, dateRange.to, orders, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    const pendingCount = orders.filter((order) => ['Draft', 'Sent'].includes(order.status)).length;
    const approvedCount = orders.filter((order) => order.status === 'Accepted').length;
    const completedCount = orders.filter((order) => order.status === 'Completed').length;

    return {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingCount,
      approvedCount,
      completedCount,
      deliveriesDueToday: orders.filter(
        (order) => order.expectedDeliveryDate === new Date().toISOString().slice(0, 10),
      ).length,
    };
  }, [orders]);

  const listBottomPadding = tabBarHeight + 92;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: listBottomPadding }]}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Purchase Orders</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Start your trade lifecycle from PO to financing</Text>

            <View style={styles.summaryGrid}>
              <SummaryCard
                title="Total Orders"
                value={String(summary.totalOrders)}
                insight={formatCurrency(summary.totalValue)}
              />
              <SummaryCard
                title="Pending Orders"
                value={String(summary.pendingCount)}
                insight={`${summary.pendingCount} awaiting approval`}
              />
              <SummaryCard
                title="Approved Orders"
                value={String(summary.approvedCount)}
                insight="Accepted by supplier"
              />
              <SummaryCard
                title="Completed Orders"
                value={String(summary.completedCount)}
                insight="Delivered and closed"
              />
            </View>

            <View style={styles.alertsWrap}>
              <View style={[styles.alertCard, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.warning}40` }]}>
                <Text style={[styles.alertTitle, { color: theme.colors.warning }]}>3 orders awaiting approval</Text>
                <Text style={[styles.alertText, { color: theme.colors.muted }]}>Follow up with suppliers for confirmation.</Text>
              </View>
              <View style={[styles.alertCard, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.info}40` }]}>
                <Text style={[styles.alertTitle, { color: theme.colors.info }]}>{summary.deliveriesDueToday} deliveries due today</Text>
                <Text style={[styles.alertText, { color: theme.colors.muted }]}>Review incoming stock schedules.</Text>
              </View>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by PO number or supplier"
              placeholderTextColor={theme.colors.muted}
              style={[styles.searchInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {STATUS_OPTIONS.map((status) => {
                const selected = statusFilter === status;

                return (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? theme.colors.onPrimary : theme.colors.text, fontWeight: '600' }}>
                      {status}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.dateRow}>
              <TextInput
                value={dateRange.from ?? ''}
                onChangeText={(value) => setDateRange((prev) => ({ ...prev, from: value || undefined }))}
                placeholder="From (YYYY-MM-DD)"
                placeholderTextColor={theme.colors.muted}
                style={[styles.dateInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              />
              <TextInput
                value={dateRange.to ?? ''}
                onChangeText={(value) => setDateRange((prev) => ({ ...prev, to: value || undefined }))}
                placeholder="To (YYYY-MM-DD)"
                placeholderTextColor={theme.colors.muted}
                style={[styles.dateInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Orders</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No purchase orders found</Text>
            <Text style={[styles.emptyText, { color: theme.colors.muted }]}>Try adjusting filters or creating a new order.</Text>
          </View>
        }
      />

      <Pressable
        onPress={() => navigation.navigate('CreatePurchaseOrder')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: tabBarHeight -100,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>New Purchase Order</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerWrap: {
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  alertsWrap: {
    gap: 8,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  separator: {
    height: 10,
  },
  emptyWrap: {
    marginTop: 36,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B6BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  fabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
});
