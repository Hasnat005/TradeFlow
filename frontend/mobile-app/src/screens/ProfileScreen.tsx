import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoRow } from '../components/profile/InfoRow';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { SectionCard } from '../components/profile/SectionCard';
import { SettingsItem } from '../components/profile/SettingsItem';
import { ToggleItem } from '../components/profile/ToggleItem';
import { useFinancingStore } from '../features/financing/store/useFinancingStore';
import { useInvoicesStore } from '../features/invoices/store/useInvoicesStore';
import { useOrdersStore } from '../features/orders/store/useOrdersStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppStore } from '../store/useAppStore';

export function ProfileScreen() {
  const theme = useAppTheme();
  const companyName = useAppStore((state) => state.companyName ?? 'Hasnat Traders Ltd.');
  const userName = useAppStore((state) => state.userName ?? 'Ava');
  const themeMode = useAppStore((state) => state.themeMode);
  const toggleThemeMode = useAppStore((state) => state.toggleThemeMode);
  const logout = useAppStore((state) => state.logout);

  const financingRequests = useFinancingStore((state) => state.requests);
  const invoices = useInvoicesStore((state) => state.invoices);
  const orders = useOrdersStore((state) => state.orders);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [financingUpdates, setFinancingUpdates] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);

  const summary = useMemo(() => {
    const availableBalance = invoices
      .filter((invoice) => invoice.status === 'Paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const creditLimit = 120000;

    return {
      availableBalance,
      creditLimit,
      activeFinancingCount: financingRequests.filter((request) =>
        ['Approved', 'Disbursed'].includes(request.status),
      ).length,
      totalTransactions: invoices.length + orders.length,
    };
  }, [financingRequests, invoices, orders]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Company Overview" icon="business-outline">
        <ProfileHeader companyName={companyName} industry="Trade & Distribution" verified />
        <InfoRow label="Registered Email" value="finance@hasnattraders.com" />
        <InfoRow label="Phone Number" value="+880 1711-000000" />
        <InfoRow label="Account ID" value="CMP-HTL-90812" />
        </SectionCard>

        <SectionCard title="Account Summary" icon="wallet-outline">
        <InfoRow label="Available Balance" value={formatCurrency(summary.availableBalance)} />
        <InfoRow label="Credit Limit" value={formatCurrency(summary.creditLimit)} />
        <InfoRow label="Active Financing" value={String(summary.activeFinancingCount)} />
        <InfoRow label="Total Transactions" value={String(summary.totalTransactions)} />
        </SectionCard>

        <SectionCard title="Business Details" icon="briefcase-outline">
        <InfoRow label="Company Name" value={companyName} />
        <InfoRow label="Business Type" value="Distributor" />
        <InfoRow label="Address" value="Plot 32, Dhaka Export Zone" />
        <InfoRow label="Tax ID" value="TIN-3278-8821" />
        <SettingsItem
          icon="create-outline"
          title="Edit Profile"
          subtitle="Update company details and registration data"
          onPress={() => Alert.alert('Edit Profile', 'Profile editing workflow can be connected to API.')}
        />
        </SectionCard>

        <SectionCard title="Security Settings" icon="lock-closed-outline">
        <SettingsItem
          icon="key-outline"
          title="Change Password"
          subtitle="Update your account password"
          onPress={() => Alert.alert('Change Password', `Hello ${userName}, password flow is ready for API integration.`)}
        />
        <ToggleItem icon="shield-checkmark-outline" title="Enable 2FA" value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} />
        <SettingsItem
          icon="desktop-outline"
          title="Login Sessions"
          subtitle="Review active devices and recent logins"
          onPress={() => Alert.alert('Login Sessions', 'Session management UI can be connected to backend data.')}
        />
        <SettingsItem icon="log-out-outline" title="Logout" danger onPress={logout} />
        </SectionCard>

        <SectionCard title="Bank & Payments" icon="card-outline">
        <InfoRow label="Linked Bank" value="Trust Bank •••• 8821" />
        <SettingsItem
          icon="add-circle-outline"
          title="Add Bank Account"
          subtitle="Link a new settlement account"
          onPress={() => Alert.alert('Add Bank Account', 'Bank onboarding flow can be connected.')}
        />
        <SettingsItem
          icon="create-outline"
          title="Update Bank Details"
          subtitle="Modify existing account details"
          onPress={() => Alert.alert('Update Bank Details', 'Secure bank update flow can be connected.')}
        />
        </SectionCard>

        <SectionCard title="Notification Settings" icon="notifications-outline">
        <ToggleItem icon="cash-outline" title="Payment Alerts" value={paymentAlerts} onValueChange={setPaymentAlerts} />
        <ToggleItem icon="stats-chart-outline" title="Financing Updates" value={financingUpdates} onValueChange={setFinancingUpdates} />
        <ToggleItem icon="document-text-outline" title="Invoice Reminders" value={invoiceReminders} onValueChange={setInvoiceReminders} />
        </SectionCard>

        <SectionCard title="Documents & KYC" icon="document-outline">
        <InfoRow label="Trade License" value="Verified" />
        <InfoRow label="Tax Certificate" value="Pending" />
        <InfoRow label="Identity Verification" value="Verified" />
        <SettingsItem
          icon="cloud-upload-outline"
          title="Upload Document"
          subtitle="Submit new compliance files"
          onPress={() => Alert.alert('Upload Document', 'Document upload flow can be connected.')}
        />
        </SectionCard>

        <SectionCard title="App Settings" icon="settings-outline">
        <ToggleItem
          icon="moon-outline"
          title="Dark Mode"
          value={themeMode === 'dark'}
          onValueChange={() => toggleThemeMode()}
        />
        <SettingsItem
          icon="language-outline"
          title="Language"
          subtitle="English"
          onPress={() => Alert.alert('Language', 'Language selector can be connected.')}
        />
        <SettingsItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Contact support team"
          onPress={() => Alert.alert('Help & Support', 'Support workflow can be connected.')}
        />
        <SettingsItem
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Policies and legal terms"
          onPress={() => Alert.alert('Terms & Privacy', 'Legal documents can be opened here.')}
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
});
