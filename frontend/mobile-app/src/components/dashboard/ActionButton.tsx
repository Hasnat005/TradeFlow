import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function ActionButton({ label, iconName, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.88 : 1,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.primary}14` }]}>
        <Ionicons name={iconName} size={18} color={theme.colors.primary} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    minHeight: 90,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
