import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ActionItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  compact?: boolean;
  onPress?: () => void;
};

export function ActionItem({ icon, label, color, compact, onPress }: ActionItemProps) {
  const theme = useAppTheme();
  const iconColor = color ?? theme.colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, compact ? styles.compactContainer : null, { opacity: pressed ? 0.85 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    minHeight: 110,
    borderRadius: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FBFF',
  },
  compactContainer: {
    minHeight: 96,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
