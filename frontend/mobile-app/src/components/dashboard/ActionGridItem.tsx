import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function ActionGridItem({ label, iconName, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.86 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.primary}14` }]}>
        <Ionicons name={iconName} size={18} color={theme.colors.primary} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '23%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
