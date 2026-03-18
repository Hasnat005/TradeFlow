import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'tradeflow_auth_token';
const AUTH_USER_NAME_KEY = 'tradeflow_auth_user_name';
const AUTH_COMPANY_NAME_KEY = 'tradeflow_auth_company_name';

export async function storeAuthSession(token: string, userName: string, companyName: string) {
  await Promise.all([
    SecureStore.setItemAsync(AUTH_TOKEN_KEY, token),
    SecureStore.setItemAsync(AUTH_USER_NAME_KEY, userName),
    SecureStore.setItemAsync(AUTH_COMPANY_NAME_KEY, companyName),
  ]);
}

export async function readAuthSession() {
  const [token, userName, companyName] = await Promise.all([
    SecureStore.getItemAsync(AUTH_TOKEN_KEY),
    SecureStore.getItemAsync(AUTH_USER_NAME_KEY),
    SecureStore.getItemAsync(AUTH_COMPANY_NAME_KEY),
  ]);

  if (!token || !userName || !companyName) {
    return null;
  }

  return {
    token,
    userName,
    companyName,
  };
}

export async function clearAuthSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
    SecureStore.deleteItemAsync(AUTH_USER_NAME_KEY),
    SecureStore.deleteItemAsync(AUTH_COMPANY_NAME_KEY),
  ]);
}
