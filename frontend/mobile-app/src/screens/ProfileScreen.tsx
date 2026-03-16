import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '../store/useAppStore';

export function ProfileScreen() {
  const logout = useAppStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account preferences and session settings.</Text>
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
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
  button: {
    marginTop: 10,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
