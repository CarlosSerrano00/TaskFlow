import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';

import { exchangeAuthCode } from '@/lib/auth-links';
import { getAuthCallbackUrl, getPasswordRecoveryUrl } from '@/lib/redirect-urls';
import { supabase } from '@/lib/supabase';
import { AuthFlowCancelledError, getAuthErrorMessage } from '@/utils/errors';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  displayName: string;
  email: string;
  initials: string;
  initializing: boolean;
  passwordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  markPasswordRecoverySession: () => void;
  clearPasswordRecoverySession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getDisplayName(user: User | null): string {
  if (!user) return '';
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined) ??
    (metadata?.display_name as string | undefined);

  if (name?.trim()) return name.trim();
  return user.email?.split('@')[0] ?? 'Usuario';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
      })
      .catch(() => {
        // The app can still render the public screens if storage fails.
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setInitializing(false);

      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(getAuthErrorMessage(error));
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) throw new Error(getAuthErrorMessage(error));

    // When email confirmation is enabled Supabase returns a user with an
    // empty identities array if the address is already registered.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('Ya existe una cuenta con este correo electrónico. Inicia sesión.');
    }

    return { needsConfirmation: !data.session };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = getAuthCallbackUrl();

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw new Error(getAuthErrorMessage(error));
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) throw new Error(getAuthErrorMessage(error));
    if (!data.url) throw new Error('No se pudo iniciar el flujo de autenticación con Google.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success') {
      const exchange = await exchangeAuthCodeFromUrl(result.url);
      if (exchange.error) throw new Error(exchange.error);
      return;
    }

    // On some Android devices the redirect is delivered through the Linking
    // listener instead of the browser result. Check for a session before
    // treating the flow as cancelled.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new AuthFlowCancelledError();
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(getAuthErrorMessage(error));
    setPasswordRecovery(false);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getPasswordRecoveryUrl(),
    });
    if (error) throw new Error(getAuthErrorMessage(error));
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(getAuthErrorMessage(error));
    setPasswordRecovery(false);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const email = session?.user.email;
      if (!email) {
        throw new Error('No se encontró el correo de la cuenta. Vuelve a iniciar sesión.');
      }

      // Real reauthentication before changing the password.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) {
        throw new Error(getAuthErrorMessage(reauthError));
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(getAuthErrorMessage(error));
    },
    [session?.user.email],
  );

  const markPasswordRecoverySession = useCallback(() => setPasswordRecovery(true), []);
  const clearPasswordRecoverySession = useCallback(() => setPasswordRecovery(false), []);

  const displayName = useMemo(() => getDisplayName(session?.user ?? null), [session?.user]);
  const email = session?.user.email ?? '';
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      displayName,
      email,
      initials,
      initializing,
      passwordRecovery,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      requestPasswordReset,
      updatePassword,
      changePassword,
      markPasswordRecoverySession,
      clearPasswordRecoverySession,
    }),
    [
      session,
      displayName,
      email,
      initials,
      initializing,
      passwordRecovery,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      requestPasswordReset,
      updatePassword,
      changePassword,
      markPasswordRecoverySession,
      clearPasswordRecoverySession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function exchangeAuthCodeFromUrl(url: string) {
  const match = /[?&]code=([^&#]+)/.exec(url);
  if (!match) {
    return { handled: false, error: 'No se recibió el código de autenticación.' };
  }
  return exchangeAuthCode(decodeURIComponent(match[1]));
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return context;
}
