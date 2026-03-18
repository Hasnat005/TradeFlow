import { apiClient } from './apiClient';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  companyName: string;
  businessType?: 'Supplier' | 'Buyer / Distributor' | 'Exporter';
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export type RegisterPayload = {
  company_name: string;
  business_type: 'Supplier' | 'Buyer / Distributor' | 'Exporter';
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export async function loginApi(payload: LoginPayload) {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
}

export async function signupApi(payload: SignupPayload) {
  const response = await apiClient.post('/auth/signup', payload);
  return response.data;
}

export async function registerApi(payload: RegisterPayload) {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
}

export async function forgotPasswordApi(payload: ForgotPasswordPayload) {
  const response = await apiClient.post('/auth/forgot-password', payload);
  return response.data;
}
