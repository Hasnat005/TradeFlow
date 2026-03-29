import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AppButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary ? theme.colors.primary : 'transparent';
  const textColor = isPrimary ? theme.colors.onPrimary : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: isPrimary ? 'transparent' : theme.colors.border,
          opacity: isDisabled ? 0.6 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? theme.colors.onPrimary : theme.colors.primary} />
      ) : (
        <View>
          <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
});