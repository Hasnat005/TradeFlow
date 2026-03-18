import { apiClient } from './apiClient';

export type UpdateProfilePayload = Partial<{
  companyName: string;
  businessType: 'Supplier' | 'Distributor' | 'Exporter';
  address: string;
  taxId: string;
  industryType: string;
  phoneNumber: string;
}>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type AddBankAccountPayload = {
  bankName: string;
  accountNumber: string;
};

export async function getProfile(token: string) {
  const response = await apiClient.get('/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload, token: string) {
  const response = await apiClient.patch('/profile', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function changeProfilePassword(payload: ChangePasswordPayload, token: string) {
  const response = await apiClient.patch('/profile/password', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function addProfileBankAccount(payload: AddBankAccountPayload, token: string) {
  const response = await apiClient.post('/profile/bank', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function getProfileDocuments(token: string) {
  const response = await apiClient.get('/profile/documents', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}
