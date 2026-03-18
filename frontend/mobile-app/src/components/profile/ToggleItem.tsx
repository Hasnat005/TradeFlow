import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ToggleItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleItem({ icon, title, value, onValueChange }: ToggleItemProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.item, { borderColor: theme.colors.border }]}>
      <View style={styles.left}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: `${theme.colors.muted}55`, true: `${theme.colors.primary}66` }}
        thumbColor={value ? theme.colors.primary : '#f4f3f4'}
      />
    </View>
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
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
});
