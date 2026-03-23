import { useMutation, useQuery } from '@tanstack/react-query';

import {
  addProfileBankAccount,
  changeProfilePassword,
  getProfile,
  updateProfile,
  uploadProfileDocument,
  type AddBankAccountPayload,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
  type UploadDocumentPayload,
} from '../../../services/profileApi';
import { queryClient } from '../../../services/queryClient';

export type ProfileResponseData = {
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
  bankAccounts: Array<{
    id: string;
    bankName: string;
    maskedAccountNumber: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    status: string;
    fileUrl: string;
  }>;
};

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

const profileQueryKey = ['profile', 'details'];

export function useProfileQuery() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const response = (await getProfile()) as ApiSuccessResponse<ProfileResponseData>;
      return response.data;
    },
  });
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = (await updateProfile(payload)) as ApiSuccessResponse<unknown>;
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useAddBankMutation() {
  return useMutation({
    mutationFn: async (payload: AddBankAccountPayload) => {
      const response = (await addProfileBankAccount(payload)) as ApiSuccessResponse<unknown>;
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useUploadDocumentMutation() {
  return useMutation({
    mutationFn: async (payload: UploadDocumentPayload) => {
      const response = (await uploadProfileDocument(payload)) as ApiSuccessResponse<unknown>;
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = (await changeProfilePassword(payload)) as ApiSuccessResponse<unknown>;
      return response.data;
    },
  });
}
