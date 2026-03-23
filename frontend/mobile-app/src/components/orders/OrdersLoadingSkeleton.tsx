import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

export function OrdersLoadingSkeleton() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((entry) => (
        <View key={entry} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.row, { backgroundColor: `${theme.colors.muted}20` }]} />
          <View style={[styles.rowWide, { backgroundColor: `${theme.colors.muted}20` }]} />
          <View style={[styles.row, { backgroundColor: `${theme.colors.muted}20` }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  row: {
    height: 12,
    borderRadius: 6,
    width: '45%',
  },
  rowWide: {
    height: 14,
    borderRadius: 6,
    width: '75%',
  },
});
