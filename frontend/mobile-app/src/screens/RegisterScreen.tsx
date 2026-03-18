import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '../components/auth/ErrorMessage';
import { FormStepContainer } from '../components/auth/FormStepContainer';
import { InputField } from '../components/auth/InputField';
import { PasswordField } from '../components/auth/PasswordField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { SelectField } from '../components/auth/SelectField';
import { StepIndicator } from '../components/auth/StepIndicator';
import { useAppTheme } from '../hooks/useAppTheme';
import { registerApi } from '../services/authApi';
import { useAppStore } from '../store/useAppStore';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type BusinessType = 'Supplier' | 'Buyer / Distributor' | 'Exporter';

type FieldErrors = {
  companyName?: string;
  businessType?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
};

const businessTypeOptions: BusinessType[] = ['Supplier', 'Buyer / Distributor', 'Exporter'];

export function RegisterScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const login = useAppStore((state) => state.login);

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorText, setErrorText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());
  const hasPasswordRuleMatch = (value: string) => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
  const isValidPhone = (value: string) => value.trim().length === 0 || /^[+]?[- 0-9()]{7,20}$/.test(value.trim());

  const getStepErrors = (targetStep: number): FieldErrors => {
    const errors: FieldErrors = {};

    if (targetStep === 1) {
      if (companyName.trim().length < 2) {
        errors.companyName = 'Company name must be at least 2 characters.';
      }

      if (!businessType) {
        errors.businessType = 'Please select a business type.';
      }
    }

    if (targetStep === 2) {
      if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.';
      }

      if (!hasPasswordRuleMatch(password)) {
        errors.password = 'Use at least 8 characters with letters and numbers.';
      }

      if (confirmPassword !== password || !confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (targetStep === 3) {
      if (!isValidPhone(phone)) {
        errors.phone = 'Please enter a valid phone number.';
      }

      if (address.trim().length > 0 && address.trim().length < 5) {
        errors.address = 'Address should be at least 5 characters if provided.';
      }
    }

    return errors;
  };

  const currentStepErrors = getStepErrors(step);
  const isCurrentStepValid = Object.keys(currentStepErrors).length === 0;

  const goNext = () => {
    if (loading) {
      return;
    }

    const errors = getStepErrors(step);
    setFieldErrors(errors);
    setErrorText(undefined);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setStep((current) => Math.min(3, current + 1));
  };

  const goBack = () => {
    if (loading) {
      return;
    }

    setErrorText(undefined);
    setStep((current) => Math.max(1, current - 1));
  };

  const submit = async () => {
    if (loading) {
      return;
    }

    const errors = getStepErrors(3);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || !businessType) {
      return;
    }

    try {
      setLoading(true);
      setErrorText(undefined);

      const response = await registerApi({
        company_name: companyName.trim(),
        business_type: businessType,
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      const token: string | undefined = response?.data?.token;
      const userName: string | undefined = response?.data?.user?.name;
      const createdCompanyName: string | undefined = response?.data?.company?.companyName;

      if (token && userName && createdCompanyName) {
        await login({ token, userName, companyName: createdCompanyName });
        return;
      }

      navigation.navigate('Login');
    } catch (error) {
      const apiMessage =
        error instanceof AxiosError
          ? (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message
          : undefined;

      setErrorText(apiMessage ?? 'Signup failed. Please try another email or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepFields = () => {
    if (step === 1) {
      return (
        <>
          <InputField
            label="Company Name"
            value={companyName}
            onChangeText={(value) => {
              setCompanyName(value);
              if (fieldErrors.companyName) {
                setFieldErrors((prev) => ({ ...prev, companyName: undefined }));
              }
            }}
            placeholder="Hasnat Traders Ltd."
            autoCapitalize="words"
            errorText={fieldErrors.companyName}
          />

          <SelectField
            label="Business Type"
            value={businessType}
            options={businessTypeOptions}
            onSelect={(option) => {
              setBusinessType(option as BusinessType);
              if (fieldErrors.businessType) {
                setFieldErrors((prev) => ({ ...prev, businessType: undefined }));
              }
            }}
            errorText={fieldErrors.businessType}
          />
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <InputField
            label="Business Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="name@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            errorText={fieldErrors.email}
          />

          <PasswordField
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            secureTextEntry={passwordHidden}
            onToggleSecureEntry={() => setPasswordHidden((value) => !value)}
            errorText={fieldErrors.password}
          />

          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            secureTextEntry={confirmPasswordHidden}
            onToggleSecureEntry={() => setConfirmPasswordHidden((value) => !value)}
            errorText={fieldErrors.confirmPassword}
          />

          <Text style={[styles.helperText, { color: theme.colors.muted }]}>Use at least 8 characters, including letters and numbers.</Text>
        </>
      );
    }

    return (
      <>
        <InputField
          label="Phone Number (Optional)"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            if (fieldErrors.phone) {
              setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }
          }}
          placeholder="+880 1XXXXXXXXX"
          keyboardType="phone-pad"
          autoCapitalize="none"
          errorText={fieldErrors.phone}
        />

        <InputField
          label="Address (Optional)"
          value={address}
          onChangeText={(value) => {
            setAddress(value);
            if (fieldErrors.address) {
              setFieldErrors((prev) => ({ ...prev, address: undefined }));
            }
          }}
          placeholder="House 12, Road 7, Dhaka"
          autoCapitalize="sentences"
          errorText={fieldErrors.address}
        />

        <Text style={[styles.securityText, { color: theme.colors.muted }]}>Your data is encrypted and secure.</Text>
      </>
    );
  };

  const primaryLabel = step === 3 ? 'Create Account' : 'Next';
  const onPrimaryPress = step === 3 ? submit : goNext;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <FormStepContainer
            title="Create Business Account"
            subtitle="Start managing trade finance digitally"
          >
            <StepIndicator currentStep={step} totalSteps={3} />

            {renderStepFields()}

            <ErrorMessage message={errorText} />

            <PrimaryButton
              label={primaryLabel}
              onPress={onPrimaryPress}
              loading={loading}
              disabled={loading || !isCurrentStepValid}
            />

            <View style={styles.footerActions}>
              {step > 1 ? (
                <Pressable onPress={goBack}>
                  <Text style={[styles.secondaryLink, { color: theme.colors.muted }]}>Back</Text>
                </Pressable>
              ) : <View />}

              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.secondaryLink, { color: theme.colors.primary }]}>Already have an account? Login</Text>
              </Pressable>
            </View>
          </FormStepContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500',
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerActions: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryLink: {
    fontSize: 12,
    fontWeight: '700',
  },
});
