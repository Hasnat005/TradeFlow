import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { InputField } from '../components/auth/InputField';
import { ErrorMessage } from '../components/auth/ErrorMessage';
import { PasswordField } from '../components/auth/PasswordField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { InfoRow } from '../components/profile/InfoRow';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { SectionCard } from '../components/profile/SectionCard';
import { SettingsItem } from '../components/profile/SettingsItem';
import { ToggleItem } from '../components/profile/ToggleItem';
import {
  ProfileResponseData,
  useAddBankMutation,
  useChangePasswordMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useUploadDocumentMutation,
} from '../features/profile/hooks/useProfile';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppStore } from '../store/useAppStore';
import { useProfileStore } from '../store/useProfileStore';

export function ProfileScreen() {
  const theme = useAppTheme();
  const logout = useAppStore((state) => state.logout);
  const toggleThemeMode = useAppStore((state) => state.toggleThemeMode);
  const themeMode = useAppStore((state) => state.themeMode);

  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const notificationPreferences = useProfileStore((state) => state.notificationPreferences);
  const setNotificationPreference = useProfileStore((state) => state.setNotificationPreference);

  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const addBankMutation = useAddBankMutation();
  const uploadDocumentMutation = useUploadDocumentMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [companyNameInput, setCompanyNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const [bankNameInput, setBankNameInput] = useState('');
  const [bankAccountInput, setBankAccountInput] = useState('');

  const [documentTypeInput, setDocumentTypeInput] = useState('');

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isCurrentPasswordHidden, setIsCurrentPasswordHidden] = useState(true);
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);

  const [profileError, setProfileError] = useState<string | undefined>();
  const [bankError, setBankError] = useState<string | undefined>();
  const [documentError, setDocumentError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data as ProfileResponseData);
    }
  }, [profileQuery.data, setProfile]);

  const isLoading = profileQuery.isLoading && !profile;
  const isError = profileQuery.isError && !profile;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const company = profile?.company;
  const user = profile?.user;
  const accountSummary = profile?.accountSummary;
  const bankAccounts = profile?.bankAccounts ?? [];
  const documents = profile?.documents ?? [];

  const validateProfileForm = () => {
    if (companyNameInput.trim().length < 2) {
      setProfileError('Company name must be at least 2 characters.');
      return false;
    }

    if (addressInput.trim().length < 5) {
      setProfileError('Address must be at least 5 characters.');
      return false;
    }

    if (phoneInput.trim().length > 0 && !/^[+]?[- 0-9()]{7,20}$/.test(phoneInput.trim())) {
      setProfileError('Please enter a valid phone number.');
      return false;
    }

    return true;
  };

  const saveProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      setProfileError(undefined);
      await updateProfileMutation.mutateAsync({
        companyName: companyNameInput.trim(),
        address: addressInput.trim(),
        phoneNumber: phoneInput.trim() || undefined,
      });
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile.';
      setProfileError(message);
    }
  };

  const addBankAccount = async () => {
    if (bankNameInput.trim().length < 2) {
      setBankError('Bank name is required.');
      return;
    }

    if (bankAccountInput.replace(/\s/g, '').length < 8) {
      setBankError('Enter a valid account number.');
      return;
    }

    try {
      setBankError(undefined);
      await addBankMutation.mutateAsync({
        bankName: bankNameInput.trim(),
        accountNumber: bankAccountInput.replace(/\s/g, ''),
      });
      setBankNameInput('');
      setBankAccountInput('');
      setIsAddingBank(false);
      Alert.alert('Success', 'Bank account linked successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add bank account.';
      setBankError(message);
    }
  };

  const uploadDocument = async () => {
    if (documentTypeInput.trim().length < 2) {
      setDocumentError('Document type is required.');
      return;
    }

    try {
      setDocumentError(undefined);

      const pickerResult = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled) {
        return;
      }

      const selected = pickerResult.assets[0];
      if (!selected) {
        setDocumentError('No file selected.');
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(selected.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await uploadDocumentMutation.mutateAsync({
        documentType: documentTypeInput.trim(),
        fileName: selected.name,
        fileBase64: base64,
        contentType: selected.mimeType ?? 'application/octet-stream',
      });

      setDocumentTypeInput('');
      Alert.alert('Success', 'Document uploaded successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document.';
      setDocumentError(message);
    }
  };

  const changePassword = async () => {
    if (currentPasswordInput.length < 8 || newPasswordInput.length < 8) {
      setPasswordError('Passwords must be at least 8 characters.');
      return;
    }

    if (!/[A-Za-z]/.test(newPasswordInput) || !/\d/.test(newPasswordInput)) {
      setPasswordError('New password must include letters and numbers.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordError(undefined);
      await changePasswordMutation.mutateAsync({
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setIsChangingPassword(false);
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password.';
      setPasswordError(message);
    }
  };

  const retryProfile = () => {
    void profileQuery.refetch();
  };

  const hasMutationInFlight = useMemo(
    () =>
      updateProfileMutation.isPending ||
      addBankMutation.isPending ||
      uploadDocumentMutation.isPending ||
      changePasswordMutation.isPending,
    [
      updateProfileMutation.isPending,
      addBankMutation.isPending,
      uploadDocumentMutation.isPending,
      changePasswordMutation.isPending,
    ],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: theme.colors.background }]}> 
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Couldn’t load your profile</Text>
        <Text style={[styles.errorSubtitle, { color: theme.colors.muted }]}>Please check your connection and try again.</Text>
        <View style={styles.retryWrap}>
          <PrimaryButton label="Retry" onPress={retryProfile} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard title="Company Info" icon="business-outline">
          <ProfileHeader
            companyName={company?.companyName ?? '—'}
            industry={company?.industryType ?? 'Business account'}
            verified={company?.verified}
          />
          <InfoRow label="User Name" value={user?.name ?? '—'} />
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow label="Business Type" value={company?.businessType ?? '—'} />
          <InfoRow label="Address" value={company?.address ?? '—'} />
          <InfoRow label="Tax ID" value={company?.taxId ?? '—'} />
          <InfoRow label="Phone" value={company?.phoneNumber || 'Not provided'} />

          {isEditingProfile ? (
            <View style={styles.formWrap}>
              <InputField
                label="Company Name"
                value={companyNameInput}
                onChangeText={setCompanyNameInput}
                placeholder="Company name"
                autoCapitalize="words"
              />
              <InputField
                label="Address"
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="Company address"
                autoCapitalize="sentences"
              />
              <InputField
                label="Phone Number"
                value={phoneInput}
                onChangeText={setPhoneInput}
                placeholder="+880 1XXXXXXXXX"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
              <ErrorMessage message={profileError} />
              <PrimaryButton
                label="Save Profile"
                onPress={saveProfile}
                loading={updateProfileMutation.isPending}
                disabled={hasMutationInFlight}
              />
              <Pressable onPress={() => setIsEditingProfile(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.muted }]}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <SettingsItem
              icon="create-outline"
              title="Edit Profile"
              subtitle="Update company name, address, and phone"
              onPress={() => {
                setProfileError(undefined);
                setCompanyNameInput(company?.companyName ?? '');
                setAddressInput(company?.address ?? '');
                setPhoneInput(company?.phoneNumber ?? '');
                setIsEditingProfile(true);
              }}
            />
          )}
        </SectionCard>

        <SectionCard title="Account Summary" icon="wallet-outline">
          <InfoRow label="Available Balance" value={formatCurrency(accountSummary?.availableBalance ?? 0)} />
          <InfoRow label="Credit Limit" value={formatCurrency(accountSummary?.creditLimit ?? 0)} />
          <InfoRow label="Active Financing" value={String(accountSummary?.activeFinancingCount ?? 0)} />
          <InfoRow label="Total Transactions" value={String(accountSummary?.totalTransactions ?? 0)} />
        </SectionCard>

        <SectionCard title="Bank Details" icon="card-outline">
          {bankAccounts.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.muted }]}>No linked bank accounts yet.</Text>
          ) : (
            bankAccounts.map((bank) => (
              <InfoRow key={bank.id} label={bank.bankName} value={bank.maskedAccountNumber} />
            ))
          )}

          {isAddingBank ? (
            <View style={styles.formWrap}>
              <InputField
                label="Bank Name"
                value={bankNameInput}
                onChangeText={setBankNameInput}
                placeholder="Bank name"
                autoCapitalize="words"
              />
              <InputField
                label="Account Number"
                value={bankAccountInput}
                onChangeText={setBankAccountInput}
                placeholder="Account number"
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <ErrorMessage message={bankError} />
              <PrimaryButton
                label="Add Bank Account"
                onPress={addBankAccount}
                loading={addBankMutation.isPending}
                disabled={hasMutationInFlight}
              />
              <Pressable onPress={() => setIsAddingBank(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.muted }]}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <SettingsItem
              icon="add-circle-outline"
              title="Add Bank Account"
              subtitle="Link a new settlement account"
              onPress={() => {
                setBankError(undefined);
                setIsAddingBank(true);
              }}
            />
          )}
        </SectionCard>

        <SectionCard title="Documents" icon="document-text-outline">
          {documents.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.muted }]}>No uploaded documents yet.</Text>
          ) : (
            documents.map((doc) => (
              <InfoRow key={doc.id} label={doc.documentType} value={doc.status} />
            ))
          )}

          <View style={styles.formWrap}>
            <InputField
              label="Document Type"
              value={documentTypeInput}
              onChangeText={setDocumentTypeInput}
              placeholder="Trade License / Tax Certificate"
              autoCapitalize="words"
            />
            <ErrorMessage message={documentError} />
            <PrimaryButton
              label="Upload Document"
              onPress={uploadDocument}
              loading={uploadDocumentMutation.isPending}
              disabled={hasMutationInFlight}
            />
          </View>
        </SectionCard>

        <SectionCard title="Security" icon="lock-closed-outline">
          {isChangingPassword ? (
            <View style={styles.formWrap}>
              <PasswordField
                label="Current Password"
                value={currentPasswordInput}
                onChangeText={setCurrentPasswordInput}
                secureTextEntry={isCurrentPasswordHidden}
                onToggleSecureEntry={() => setIsCurrentPasswordHidden((value) => !value)}
              />
              <PasswordField
                label="New Password"
                value={newPasswordInput}
                onChangeText={setNewPasswordInput}
                secureTextEntry={isNewPasswordHidden}
                onToggleSecureEntry={() => setIsNewPasswordHidden((value) => !value)}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPasswordInput}
                onChangeText={setConfirmPasswordInput}
                secureTextEntry={isConfirmPasswordHidden}
                onToggleSecureEntry={() => setIsConfirmPasswordHidden((value) => !value)}
              />
              <ErrorMessage message={passwordError} />
              <PrimaryButton
                label="Change Password"
                onPress={changePassword}
                loading={changePasswordMutation.isPending}
                disabled={hasMutationInFlight}
              />
              <Pressable onPress={() => setIsChangingPassword(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.muted }]}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <SettingsItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your account credentials"
              onPress={() => {
                setPasswordError(undefined);
                setIsChangingPassword(true);
              }}
            />
          )}
          <ToggleItem
            icon="shield-checkmark-outline"
            title="Enable 2FA"
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
          />
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            danger
            onPress={() => {
              void logout();
            }}
          />
        </SectionCard>

        <SectionCard title="Settings" icon="settings-outline">
          <ToggleItem
            icon="cash-outline"
            title="Payment Alerts"
            value={notificationPreferences.paymentAlerts}
            onValueChange={(value) => setNotificationPreference('paymentAlerts', value)}
          />
          <ToggleItem
            icon="stats-chart-outline"
            title="Financing Updates"
            value={notificationPreferences.financingUpdates}
            onValueChange={(value) => setNotificationPreference('financingUpdates', value)}
          />
          <ToggleItem
            icon="document-text-outline"
            title="Invoice Reminders"
            value={notificationPreferences.invoiceReminders}
            onValueChange={(value) => setNotificationPreference('invoiceReminders', value)}
          />
          <ToggleItem
            icon="moon-outline"
            title="Dark Mode"
            value={themeMode === 'dark'}
            onValueChange={() => toggleThemeMode()}
          />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorSubtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
  },
  retryWrap: {
    width: '100%',
    maxWidth: 220,
    marginTop: 14,
  },
  formWrap: {
    gap: 10,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
