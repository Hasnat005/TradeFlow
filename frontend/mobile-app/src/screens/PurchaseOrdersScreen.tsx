import { StyleSheet, Text, View } from 'react-native';

export function PurchaseOrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purchase Orders</Text>
      <Text style={styles.subtitle}>Track PO lifecycle and approvals.</Text>
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
