import { apiClient } from './apiClient';

export type UpdateProfilePayload = Partial<{
  companyName: string;
  businessType: 'Supplier' | 'Buyer / Distributor' | 'Exporter';
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

export type UploadDocumentPayload = {
  documentType: string;
  fileName: string;
  fileBase64: string;
  contentType: string;
};

export async function getProfile() {
  const response = await apiClient.get('/profile');

  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.patch('/profile', payload);

  return response.data;
}

export async function changeProfilePassword(payload: ChangePasswordPayload) {
  const response = await apiClient.patch('/profile/password', payload);

  return response.data;
}

export async function addProfileBankAccount(payload: AddBankAccountPayload) {
  const response = await apiClient.post('/profile/bank', payload);

  return response.data;
}

export async function getProfileDocuments() {
  const response = await apiClient.get('/profile/documents');

  return response.data;
}

export async function uploadProfileDocument(payload: UploadDocumentPayload) {
  const response = await apiClient.post('/profile/documents', payload);

  return response.data;
}
