import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';

type DateFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  errorText?: string;
  allowClear?: boolean;
};

function parseApiDate(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const parsed = new Date(year, month, day, 12, 0, 0, 0);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatReadableDate(value?: string) {
  const parsed = parseApiDate(value);
  if (!parsed) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function DateField({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minDate,
  maxDate,
  errorText,
  allowClear = false,
}: DateFieldProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);
  const clearedRef = useRef(false);
  const clearResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentValueDate = useMemo(() => parseApiDate(value), [value]);

  useEffect(() => {
    return () => {
      if (clearResetTimerRef.current) {
        clearTimeout(clearResetTimerRef.current);
      }
    };
  }, []);

  const openPicker = () => {
    const pickerValue = currentValueDate ?? minDate ?? startOfToday();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: pickerValue,
        minimumDate: minDate,
        maximumDate: maxDate,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            onChange(formatDateForApi(selectedDate));
          }
        },
      });
      return;
    }

    setIsOpen(true);
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}

      <Pressable
        onPress={() => {
          if (clearedRef.current) {
            clearedRef.current = false;
            return;
          }

          openPicker();
        }}
        style={({ pressed }) => [
          styles.field,
          {
            borderColor: errorText ? theme.colors.danger : theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Date field'}
      >
        <Text style={[styles.valueText, { color: value ? theme.colors.text : theme.colors.muted }]}>
          {value ? formatReadableDate(value) : placeholder}
        </Text>
        <View style={styles.trailingActions}>
          {allowClear && value ? (
            <Pressable
              onPress={() => {
                clearedRef.current = true;
                onChange('');

                if (clearResetTimerRef.current) {
                  clearTimeout(clearResetTimerRef.current);
                }

                clearResetTimerRef.current = setTimeout(() => {
                  clearedRef.current = false;
                }, 100);
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear date"
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={16} color={theme.colors.muted} />
            </Pressable>
          ) : null}
          <Ionicons name="calendar-outline" size={18} color={theme.colors.muted} />
        </View>
      </Pressable>

      {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}

      <Modal
        visible={Platform.OS === 'ios' && isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />

          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surface,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={currentValueDate ?? minDate ?? startOfToday()}
                mode="date"
                display="spinner"
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    onChange(formatDateForApi(selectedDate));
                  }
                }}
                minimumDate={minDate}
                maximumDate={maxDate}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trailingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearButton: {
    minWidth: 20,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  pickerWrap: {
    alignItems: 'center',
  },
});