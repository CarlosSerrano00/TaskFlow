import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Animation } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeAuthCode, setSessionFromTokens } from '@/lib/auth-links';
import { supabase } from '@/lib/supabase';
import { getErrorMessage } from '@/utils/errors';

type Status = 'working' | 'success' | 'error';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
    access_token?: string;
    refresh_token?: string;
  }>();
  const { session } = useAuth();

  const [status, setStatus] = useState<Status>('working');
  const [message, setMessage] = useState<string | null>(null);
  const attempted = useRef(false);

  const code = typeof params.code === 'string' ? params.code : undefined;
  const accessToken = typeof params.access_token === 'string' ? params.access_token : undefined;
  const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : undefined;
  const errorDescription =
    typeof params.error_description === 'string' ? params.error_description : undefined;

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    async function completeFlow() {
      if (errorDescription || params.error) {
        setMessage(
          params.error === 'access_denied'
            ? 'Inicio de sesión cancelado.'
            : errorDescription ?? 'No se pudo completar el inicio de sesión.',
        );
        setStatus('error');
        return;
      }

      if (code) {
        const result = await exchangeAuthCode(code);
        if (result.error) {
          setMessage(result.error);
          setStatus('error');
          return;
        }
      } else if (accessToken && refreshToken) {
        const result = await setSessionFromTokens(accessToken, refreshToken);
        if (result.error) {
          setMessage(result.error);
          setStatus('error');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage('No se pudo establecer la sesión. Inténtalo de nuevo desde el inicio de sesión.');
        setStatus('error');
        return;
      }

      setStatus('success');
    }

    void completeFlow().catch((error) => {
      setMessage(getErrorMessage(error));
      setStatus('error');
    });
  }, [accessToken, code, errorDescription, params.error, refreshToken]);

  useEffect(() => {
    if (status !== 'success') return;
    const timeout = setTimeout(() => {
      router.replace('/(tabs)');
    }, 900);
    return () => clearTimeout(timeout);
  }, [status]);

  return (
    <Screen contentClassName="items-center justify-center pb-16">
      <Logo />

      {status === 'working' ? (
        <View className="mt-8 items-center gap-3">
          <Animation name="loading" size={200} />
          <Text className="text-xl font-extrabold text-foreground">Completando inicio de sesión…</Text>
          <Text className="max-w-[300px] text-center text-sm leading-5 text-foreground-muted">
            Estamos intercambiando el código de Google por una sesión segura.
          </Text>
        </View>
      ) : null}

      {status === 'success' ? (
        <View className="mt-4 items-center gap-3">
          <Animation name="success" size={190} loop={false} />
          <Text className="text-2xl font-extrabold text-foreground">¡Todo listo!</Text>
          <Text className="text-center text-sm leading-5 text-foreground-muted">
            Sesión iniciada correctamente. Te llevamos a tu panel…
          </Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View className="mt-8 w-full items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-danger-soft">
            <Ionicons name="warning-outline" size={30} color="#DC2626" />
          </View>
          <Text className="text-center text-2xl font-extrabold text-foreground">
            No pudimos iniciar sesión
          </Text>
          <FeedbackBanner tone="error" message={message ?? 'Ocurrió un error inesperado.'} />
          <View className="mt-2 w-full gap-3">
            <Button
              title={session ? 'Volver al inicio' : 'Volver a iniciar sesión'}
              onPress={() => router.replace(session ? '/(tabs)' : '/(auth)/login')}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
