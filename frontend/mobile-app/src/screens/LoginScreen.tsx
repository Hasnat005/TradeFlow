import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const login = useAppStore((state) => state.login);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TradeFlow Login</Text>
      <Pressable style={styles.primaryButton} onPress={login}>
        <Text style={styles.primaryButtonText}>Sign In</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Create an account</Text>
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#0B6BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  link: {
    color: '#0B6BFF',
    fontWeight: '600',
  },
});
