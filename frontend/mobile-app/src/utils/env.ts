import { NativeModules, Platform } from 'react-native';

function resolveHostFromScriptUrl() {
  const scriptUrl: string | undefined = NativeModules?.SourceCode?.scriptURL;

  if (!scriptUrl) {
    return undefined;
  }

  const match = scriptUrl.match(/^https?:\/\/([^/:]+)/);
  return match?.[1];
}

function resolveApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configured) {
    return configured;
  }

  const host = resolveHostFromScriptUrl();

  if (host) {
    return `http://${host}:4000/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }

  return 'http://localhost:4000/api/v1';
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
};
