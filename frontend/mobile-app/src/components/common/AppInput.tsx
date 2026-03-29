import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type AppInputProps = TextInputProps & {
  label?: string;
  errorText?: string;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, errorText, style, placeholderTextColor, ...rest },
  ref,
) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}

      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? theme.colors.muted}
        style={[
          styles.input,
          {
            borderColor: errorText ? theme.colors.danger : theme.colors.border,
            color: theme.colors.text,
          },
          style,
        ]}
        {...rest}
      />

      {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
});