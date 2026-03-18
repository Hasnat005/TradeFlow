import { PropsWithChildren } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type SectionCardProps = PropsWithChildren<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}>;

export function SectionCard({ title, children, icon }: SectionCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          ...theme.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
});
