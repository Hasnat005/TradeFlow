import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '../components/auth/ErrorMessage';
import { InputField } from '../components/auth/InputField';
import { PasswordField } from '../components/auth/PasswordField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppStore } from '../store/useAppStore';
import { AuthStackParamList } from '../navigation/types';
import { loginApi } from '../services/authApi';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const login = useAppStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;

    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError(undefined);
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      valid = false;
    } else {
      setPasswordError(undefined);
    }

    return valid;
  };

  const submit = async () => {
    if (loading) {
      return;
    }

    setApiError(undefined);

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi({
        email: email.trim().toLowerCase(),
        password,
      });

      const token: string | undefined = response?.data?.token;
      const userName: string | undefined = response?.data?.user?.name;
      const companyName: string | undefined = response?.data?.company?.companyName;

      if (!token || !userName || !companyName) {
        throw new Error('Invalid login response');
      }

      await login(
        {
          token,
          userName,
          companyName,
        },
        rememberMe,
      );
    } catch {
      setApiError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.card}>
        <Text style={[styles.brand, { color: theme.colors.primary }]}>TradeFlow</Text>
        <Text style={[styles.tagline, { color: theme.colors.muted }]}>Digitizing Trade Finance</Text>

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          errorText={emailError}
        />

        <PasswordField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={passwordHidden}
          onToggleSecureEntry={() => setPasswordHidden((value) => !value)}
          errorText={passwordError}
        />

        <View style={styles.rowBetween}>
          <Pressable onPress={() => setRememberMe((value) => !value)} style={styles.rememberRow}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: rememberMe ? theme.colors.primary : theme.colors.border,
                  backgroundColor: rememberMe ? `${theme.colors.primary}22` : theme.colors.surface,
                },
              ]}
            />
            <Text style={[styles.rememberText, { color: theme.colors.muted }]}>Remember Me</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Forgot Password?</Text>
          </Pressable>
        </View>

        <ErrorMessage message={apiError} />

        <PrimaryButton label="Login" onPress={submit} loading={loading} disabled={loading} />

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.createAccountLink, { color: theme.colors.primary }]}>Create Account</Text>
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
  card: {
    gap: 12,
  },
  brand: {
    fontSize: 30,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  rememberText: {
    fontSize: 12,
    fontWeight: '500',
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
  },
  createAccountLink: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 6,
  },
});
