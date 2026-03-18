import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterBar } from '../components/invoices/FilterBar';
import { InvoiceCard } from '../components/invoices/InvoiceCard';
import { InvoiceDateRange, InvoiceStatusFilter } from '../features/invoices/types';
import { normalizeDate } from '../features/invoices/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { useInvoicesStore } from '../features/invoices/store/useInvoicesStore';
import { InvoicesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<InvoicesStackParamList, 'InvoiceList'>;

export function InvoicesScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const invoices = useInvoicesStore((state) => state.invoices);

  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<InvoiceDateRange>({});

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const from = dateRange.from ? normalizeDate(dateRange.from) : undefined;
    const to = dateRange.to ? normalizeDate(dateRange.to) : undefined;

    return invoices.filter((invoice) => {
      const statusMatch = statusFilter === 'All' ? true : invoice.status === statusFilter;
      const searchMatch =
        query.length === 0 ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.buyerName.toLowerCase().includes(query);

      const invoiceDate = normalizeDate(invoice.dueDate);
      const fromMatch = from && invoiceDate ? invoiceDate >= from : true;
      const toMatch = to && invoiceDate ? invoiceDate <= to : true;

      return statusMatch && searchMatch && fromMatch && toMatch;
    });
  }, [dateRange.from, dateRange.to, invoices, searchQuery, statusFilter]);

  const onOpenInvoice = (invoiceId: string) => {
    navigation.navigate('InvoiceDetail', { invoiceId });
  };

  const onCreateInvoice = () => {
    navigation.navigate('CreateInvoice');
  };

  const listBottomPadding = tabBarHeight + 88;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InvoiceCard invoice={item} onPress={() => onOpenInvoice(item.id)} />
        )}
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
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No invoices found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.muted }]}>Adjust filters or create a new invoice.</Text>
          </View>
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
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create invoice"
      >
        <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>Create Invoice</Text>
      </Pressable>
    </View>
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
  emptyWrap: {
    marginTop: 36,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
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
