import { create } from 'zustand';

type NotificationPreferences = {
  paymentAlerts: boolean;
  financingUpdates: boolean;
  invoiceReminders: boolean;
};

type ProfileDocument = {
  id: string;
  documentType: string;
  status: string;
  fileUrl: string;
};

type BankAccount = {
  id: string;
  bankName: string;
  maskedAccountNumber: string;
};

type ProfileData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  company: {
    id: string;
    companyName: string;
    businessType: string;
    address: string;
    taxId: string;
    industryType?: string | null;
    phoneNumber?: string | null;
    companyAccountId: string;
    verified: boolean;
  };
  accountSummary: {
    availableBalance: number;
    creditLimit: number;
    activeFinancingCount: number;
    totalTransactions: number;
  };
  bankAccounts: BankAccount[];
  documents: ProfileDocument[];
};

type ProfileStoreState = {
  profile?: ProfileData;
  notificationPreferences: NotificationPreferences;
  setProfile: (profile: ProfileData | undefined) => void;
  setNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  resetProfileState: () => void;
};

const initialNotificationPreferences: NotificationPreferences = {
  paymentAlerts: true,
  financingUpdates: true,
  invoiceReminders: true,
};

export const useProfileStore = create<ProfileStoreState>((set) => ({
  profile: undefined,
  notificationPreferences: initialNotificationPreferences,
  setProfile: (profile) => set(() => ({ profile })),
  setNotificationPreference: (key, value) =>
    set((state) => ({
      notificationPreferences: {
        ...state.notificationPreferences,
        [key]: value,
      },
    })),
  resetProfileState: () =>
    set(() => ({
      profile: undefined,
      notificationPreferences: initialNotificationPreferences,
    })),
}));
