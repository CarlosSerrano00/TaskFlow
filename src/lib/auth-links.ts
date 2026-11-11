import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import { getAuthErrorMessage } from '@/utils/errors';

export type AuthLinkResult = {
  handled: boolean;
  duplicate?: boolean;
  error?: string;
};

// A PKCE authorization code must only be exchanged once. Keeping the set at
// module scope protects against the Expo Router callback screen and the
// Linking listener both receiving the same URL.
const exchangedCodes = new Set<string>();

function getQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseHashParams(url: string) {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return new URLSearchParams();
  return new URLSearchParams(url.slice(hashIndex + 1));
}

export async function exchangeAuthCode(code: string): Promise<AuthLinkResult> {
  if (exchangedCodes.has(code)) {
    return { handled: true, duplicate: true };
  }

  exchangedCodes.add(code);

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return { handled: true, error: getAuthErrorMessage(error) };
  }

  return { handled: true };
}

export async function setSessionFromTokens(accessToken: string, refreshToken: string): Promise<AuthLinkResult> {
  const key = `${accessToken.slice(0, 24)}:${refreshToken.slice(0, 24)}`;
  if (exchangedCodes.has(key)) {
    return { handled: true, duplicate: true };
  }

  exchangedCodes.add(key);

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return { handled: true, error: getAuthErrorMessage(error) };
  }

  return { handled: true };
}

/**
 * Handles Supabase deep links. It intentionally only processes the OAuth
 * callback (`auth/callback`). The password recovery screen owns its own
 * callback (`reset-password`) so the two flows stay isolated.
 */
export async function handleAuthUrl(url: string): Promise<AuthLinkResult> {
  const parsed = Linking.parse(url);
  const path = (parsed.path ?? '').replace(/^\/+|\/+$/g, '');

  if (path !== 'auth/callback') {
    return { handled: false };
  }

  const params = parsed.queryParams ?? {};

  const errorDescription =
    getQueryValue(params.error_description) ?? getQueryValue(params.error);
  if (errorDescription) {
    return {
      handled: true,
      error:
        getQueryValue(params.error) === 'access_denied'
          ? 'Inicio de sesión cancelado.'
          : errorDescription,
    };
  }

  const code = getQueryValue(params.code);
  if (code) {
    return exchangeAuthCode(code);
  }

  const hash = parseHashParams(url);
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  if (accessToken && refreshToken) {
    return setSessionFromTokens(accessToken, refreshToken);
  }

  return { handled: false };
}
