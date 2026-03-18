import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type BalanceCardProps = {
  amount: string;
  updatedAt: string;
  onViewLedger?: () => void;
  onAddFunds?: () => void;
};

export function BalanceCard({ amount, updatedAt, onViewLedger, onAddFunds }: BalanceCardProps) {
  const theme = useAppTheme();

  return (
    <LinearGradient
      colors={[theme.colors.primary, '#2E7BFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: theme.radius.lg, ...theme.shadow }]}
    >
      <Text style={styles.label}>Available Balance</Text>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.updated}>Updated {updatedAt}</Text>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={onViewLedger}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>View Ledger</Text>
        </Pressable>
        <Pressable
          onPress={onAddFunds}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Add Funds</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  updated: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonRow: {
    marginTop: 2,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
