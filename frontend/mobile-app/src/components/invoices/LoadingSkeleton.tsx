import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

export function LoadingSkeleton() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.lineShort, { backgroundColor: `${theme.colors.muted}20` }]} />
          <View style={[styles.lineLong, { backgroundColor: `${theme.colors.muted}20` }]} />
          <View style={[styles.lineShort, { backgroundColor: `${theme.colors.muted}20` }]} />
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
  lineShort: {
    height: 12,
    width: '45%',
    borderRadius: 6,
  },
  lineLong: {
    height: 14,
    width: '80%',
    borderRadius: 6,
  },
});
