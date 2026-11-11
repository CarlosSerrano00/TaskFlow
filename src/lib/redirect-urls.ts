import * as Linking from 'expo-linking';

/**
 * Deep link used by Supabase OAuth (Google) on native.
 * In a development/production build this resolves to `taskflow://auth/callback`.
 * In Expo Go it resolves to an `exp://` URL that must also be allow-listed in Supabase.
 */
export function getAuthCallbackUrl() {
  return Linking.createURL('auth/callback');
}

/**
 * Deep link used by the password recovery email.
 * Kept separate from the Google callback so both flows are handled independently.
 * In a development/production build this resolves to `taskflow://reset-password`.
 */
export function getPasswordRecoveryUrl() {
  return Linking.createURL('reset-password');
}
