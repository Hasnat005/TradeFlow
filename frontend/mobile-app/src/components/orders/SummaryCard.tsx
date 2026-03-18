import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  title: string;
  value: string;
  insight: string;
};

export function SummaryCard({ title, value, insight }: Props) {
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
      <Text style={[styles.title, { color: theme.colors.muted }]}>{title}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.insight, { color: theme.colors.primary }]}>{insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
  },
  insight: {
    fontSize: 11,
    fontWeight: '600',
  },
});
