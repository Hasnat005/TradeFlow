import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

export function SettingsItem({ icon, title, subtitle, onPress, danger }: SettingsItemProps) {
  const theme = useAppTheme();
  const tint = danger ? theme.colors.danger : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          borderColor: theme.colors.border,
          backgroundColor: pressed ? `${theme.colors.primary}10` : 'transparent',
        },
      ]}
    >
      <View style={styles.left}>
        <Ionicons name={icon} size={18} color={danger ? theme.colors.danger : theme.colors.primary} />
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: tint }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
