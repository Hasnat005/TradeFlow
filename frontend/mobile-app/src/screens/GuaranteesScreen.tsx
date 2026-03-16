import { StyleSheet, Text, View } from 'react-native';

export function GuaranteesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guarantees</Text>
      <Text style={styles.subtitle}>Review guarantee instruments and exposure.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
