import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { InvoiceDateRange, InvoiceStatusFilter } from '../../features/invoices/types';
import { useAppTheme } from '../../hooks/useAppTheme';

type FilterBarProps = {
  statusFilter: InvoiceStatusFilter;
  onStatusFilterChange: (status: InvoiceStatusFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRange: InvoiceDateRange;
  onDateRangeChange: (range: InvoiceDateRange) => void;
};

const STATUS_OPTIONS: InvoiceStatusFilter[] = ['All', 'Pending', 'Paid', 'Overdue'];

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  dateRange,
  onDateRangeChange,
}: FilterBarProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder="Search by invoice ID or buyer"
        placeholderTextColor={theme.colors.muted}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
        {STATUS_OPTIONS.map((status) => {
          const selected = statusFilter === status;

          return (
            <Pressable
              key={status}
              onPress={() => onStatusFilterChange(status)}
              style={[
                styles.statusChip,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
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
          onChangeText={(value) => onDateRangeChange({ ...dateRange, from: value || undefined })}
          placeholder="From (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.muted}
          style={[
            styles.dateInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />

        <TextInput
          value={dateRange.to ?? ''}
          onChangeText={(value) => onDateRangeChange({ ...dateRange, to: value || undefined })}
          placeholder="To (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.muted}
          style={[
            styles.dateInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  statusRow: {
    gap: 8,
    paddingRight: 10,
  },
  statusChip: {
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
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 42,
    paddingHorizontal: 10,
    fontSize: 13,
  },
});
