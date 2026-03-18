import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '../components/auth/ErrorMessage';
import { InputField } from '../components/auth/InputField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { forgotPasswordApi } from '../services/authApi';
import { useAppTheme } from '../hooks/useAppTheme';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useAppTheme();

  const [email, setEmail] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (loading) {
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorText('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorText(undefined);
      await forgotPasswordApi({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      setErrorText('Unable to send reset link right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.formCard}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Enter your account email to receive a reset link.</Text>

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <ErrorMessage message={errorText} />

        {sent ? <Text style={[styles.successText, { color: theme.colors.success }]}>Reset link sent. Check your inbox.</Text> : null}

        <PrimaryButton label="Send Reset Link" onPress={submit} loading={loading} disabled={loading} />

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Back to Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formCard: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 4,
  },
});
