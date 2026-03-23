import axios from 'axios';

import { env } from '../utils/env';
import { useAppStore } from '../store/useAppStore';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().authToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await useAppStore.getState().logout();
    }

    return Promise.reject(error);
  },
);
