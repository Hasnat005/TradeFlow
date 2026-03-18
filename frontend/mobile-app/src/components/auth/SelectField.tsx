import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onSelect: (option: string) => void;
  errorText?: string;
};

export function SelectField({ label, value, options, onSelect, errorText }: SelectFieldProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

      <View style={styles.optionsRow}>
        {options.map((option) => {
          const selected = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? `${theme.colors.primary}18` : theme.colors.surface,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: selected ? theme.colors.primary : theme.colors.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      {errorText ? <Text style={[styles.error, { color: theme.colors.danger }]}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsRow: {
    gap: 8,
  },
  option: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    fontSize: 11,
    fontWeight: '600',
  },
});
