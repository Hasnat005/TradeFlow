import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateField } from '../common/DateField';
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

const STATUS_OPTIONS: InvoiceStatusFilter[] = ['All', 'Draft', 'Sent', 'Financed', 'Paid', 'Overdue'];

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  dateRange,
  onDateRangeChange,
}: FilterBarProps) {
  const theme = useAppTheme();
  const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : undefined;
  const toDate = dateRange.to ? new Date(`${dateRange.to}T00:00:00`) : undefined;

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
        <View style={styles.dateInputWrap}>
          <DateField
            label="From"
            value={dateRange.from}
            onChange={(value) => {
              if (!value) {
                onDateRangeChange({ ...dateRange, from: undefined });
                return;
              }

              if (dateRange.to && value > dateRange.to) {
                onDateRangeChange({ ...dateRange, from: value, to: undefined });
                return;
              }

              onDateRangeChange({ ...dateRange, from: value });
            }}
            placeholder="Select date"
            maxDate={toDate}
            allowClear
          />
        </View>

        <View style={styles.dateInputWrap}>
          <DateField
            label="To"
            value={dateRange.to}
            onChange={(value) => onDateRangeChange({ ...dateRange, to: value || undefined })}
            placeholder="Select date"
            minDate={fromDate}
            allowClear
          />
        </View>
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
  dateInputWrap: {
    flex: 1,
  },
});
