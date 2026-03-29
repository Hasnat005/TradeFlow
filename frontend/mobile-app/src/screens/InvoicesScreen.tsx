import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/common/AppCard';
import { EmptyState } from '../components/invoices/EmptyState';
import { FilterBar } from '../components/invoices/FilterBar';
import { InvoiceCard } from '../components/invoices/InvoiceCard';
import { LoadingSkeleton } from '../components/invoices/LoadingSkeleton';
import { useInvoicesListQuery } from '../features/invoices/hooks/useInvoices';
import { InvoiceDateRange, InvoiceStatusFilter } from '../features/invoices/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { InvoicesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<InvoicesStackParamList, 'InvoiceList'>;

export function InvoicesScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<InvoiceDateRange>({});

  const query = useMemo(() => {
    const trimmedSearch = searchQuery.trim();

    return {
      status: statusFilter === 'All' ? undefined : statusFilter,
      search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
      from: dateRange.from,
      to: dateRange.to,
    };
  }, [dateRange.from, dateRange.to, searchQuery, statusFilter]);

  const { data, isLoading, isError, refetch } = useInvoicesListQuery(query);

  const invoices = data?.invoices ?? [];
  const alerts = data?.alerts ?? [];

  const onOpenInvoice = (invoiceId: string) => {
    navigation.navigate('InvoiceDetail', { invoiceId });
  };

  const onCreateInvoice = () => {
    navigation.navigate('CreateInvoice');
  };

  const listBottomPadding = tabBarHeight + 88;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InvoiceCard invoice={item} onPress={() => onOpenInvoice(item.id)} />}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Invoice Management</Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.muted }]}>Track, filter, and finance receivables</Text>
            <FilterBar
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            {alerts.map((alert) => {
              const borderColor =
                alert.tone === 'danger'
                  ? theme.colors.danger
                  : alert.tone === 'warning'
                    ? theme.colors.warning
                    : alert.tone === 'success'
                      ? theme.colors.success
                      : theme.colors.info;

              return (
                <AppCard
                  key={alert.id}
                  style={[styles.alertCard, { borderColor }]}
                >
                  <Text style={[styles.alertTitle, { color: theme.colors.text }]}>{alert.title}</Text>
                  <Text style={[styles.alertDescription, { color: theme.colors.muted }]}>{alert.description}</Text>
                </AppCard>
              );
            })}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <EmptyState
              title="Could not load invoices"
              message="Please check your connection and try again."
              actionLabel="Retry"
              onAction={() => {
                void refetch();
              }}
            />
          ) : (
            <EmptyState
              title="No invoices found"
              message="Adjust filters or create a new invoice."
              actionLabel="Create Invoice"
              onAction={onCreateInvoice}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={onCreateInvoice}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            bottom: tabBarHeight - 100,
            opacity: pressed ? 0.92 : 1,
            ...theme.shadow,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create invoice"
      >
        <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>Create Invoice</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    gap: 12,
    marginBottom: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  alertCard: {
    gap: 4,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 10,
  },
  fab: {
    position: 'absolute',
    right: 16,
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
});
