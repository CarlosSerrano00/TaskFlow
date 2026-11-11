import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, IconButton } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Animation } from '@/components/ui/animation';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeAuthCode, setSessionFromTokens } from '@/lib/auth-links';
import { getErrorMessage } from '@/utils/errors';
import { validatePassword, validatePasswordConfirmation } from '@/utils/validation';

type Status = 'working' | 'ready' | 'invalid' | 'success';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
    access_token?: string;
    refresh_token?: string;
  }>();
  const { session, passwordRecovery, updatePassword, markPasswordRecoverySession } = useAuth();

  const [status, setStatus] = useState<Status>('working');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const attempted = useRef(false);

  const code = typeof params.code === 'string' ? params.code : undefined;
  const accessToken = typeof params.access_token === 'string' ? params.access_token : undefined;
  const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : undefined;
  const linkErrorMessage = typeof params.error_description === 'string' ? params.error_description : undefined;

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    async function resolveLink() {
      if (linkErrorMessage || params.error) {
        setLinkError(linkErrorMessage ?? 'El enlace de recuperación no es válido o expiró.');
        setStatus('invalid');
        return;
      }

      if (code) {
        const result = await exchangeAuthCode(code);
        if (result.error) {
          setLinkError(result.error);
          setStatus('invalid');
          return;
        }
        markPasswordRecoverySession();
        setStatus('ready');
        return;
      }

      if (accessToken && refreshToken) {
        const result = await setSessionFromTokens(accessToken, refreshToken);
        if (result.error) {
          setLinkError(result.error);
          setStatus('invalid');
          return;
        }
        markPasswordRecoverySession();
        setStatus('ready');
        return;
      }

      if (passwordRecovery) {
        setStatus('ready');
        return;
      }

      setStatus('invalid');
    }

    void resolveLink().catch((error) => {
      setLinkError(getErrorMessage(error));
      setStatus('invalid');
    });
  }, [
    accessToken,
    code,
    linkErrorMessage,
    markPasswordRecoverySession,
    params.error,
    passwordRecovery,
    refreshToken,
  ]);

  async function handleSubmit() {
    setFormError(null);
    const nextErrors = {
      password: validatePassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await updatePassword(password);
      setStatus('success');
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (status === 'working') {
    return (
      <Screen contentClassName="items-center justify-center pb-16">
        <Animation name="loading" size={200} />
        <Text className="mt-4 text-center text-lg font-bold text-foreground">Validando enlace seguro…</Text>
        <Text className="mt-2 max-w-[300px] text-center text-sm leading-5 text-foreground-muted">
          Estamos verificando tu enlace de recuperación con Supabase.
        </Text>
      </Screen>
    );
  }

  if (status === 'invalid') {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-danger-soft">
            <Ionicons name="link-outline" size={30} color="#DC2626" />
          </View>
          <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Enlace no válido
          </Text>
          <Text className="max-w-[330px] text-center text-base leading-6 text-foreground-muted">
            {linkError ??
              'Este enlace ya no es válido o expiró. Solicita uno nuevo desde la pantalla de inicio de sesión.'}
          </Text>

          <View className="mt-4 w-full gap-3">
            {session ? (
              <Button title="Volver al inicio" onPress={() => router.replace('/(tabs)')} />
            ) : (
              <>
                <Button
                  title="Solicitar un nuevo enlace"
                  onPress={() => router.replace('/(auth)/forgot-password')}
                />
                <Button
                  title="Volver a iniciar sesión"
                  variant="secondary"
                  onPress={() => router.replace('/(auth)/login')}
                />
              </>
            )}
          </View>
        </View>
      </Screen>
    );
  }

  if (status === 'success') {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <Animation name="success" size={190} loop={false} />
          <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Contraseña actualizada
          </Text>
          <Text className="max-w-[320px] text-center text-base leading-6 text-foreground-muted">
            Tu nueva contraseña ya está activa. Puedes continuar usando TaskFlow con la sesión actual.
          </Text>
          <View className="mt-4 w-full">
            <Button title="Ir a mi panel" onPress={() => router.replace('/(tabs)')} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard contentClassName="pb-14">
      <View className="mb-6 flex-row items-center justify-between">
        <Logo />
        <IconButton
          icon="close"
          accessibilityLabel="Cerrar"
          onPress={() => router.replace(session ? '/(tabs)' : '/(auth)/login')}
        />
      </View>

      <View className="mb-8 items-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft">
          <Ionicons name="shield-checkmark-outline" size={30} color="#5B5BD6" />
        </View>
        <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
          Crea una nueva contraseña
        </Text>
        <Text className="max-w-[320px] text-center text-base leading-6 text-foreground-muted">
          Elige una contraseña segura de al menos 8 caracteres. La usarás la próxima vez que inicies
          sesión con tu correo.
        </Text>
      </View>

      <View className="gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        {formError ? <FeedbackBanner tone="error" message={formError} onDismiss={() => setFormError(null)} /> : null}

        <TextField
          label="Nueva contraseña"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (errors.password) setErrors((current) => ({ ...current, password: null }));
          }}
          placeholder="Mínimo 8 caracteres"
          icon="lock-closed-outline"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.password}
        />

        <TextField
          label="Confirmar nueva contraseña"
          value={confirmation}
          onChangeText={(value) => {
            setConfirmation(value);
            if (errors.confirmation) setErrors((current) => ({ ...current, confirmation: null }));
          }}
          placeholder="Repite tu nueva contraseña"
          icon="shield-checkmark-outline"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.confirmation}
        />

        <Button
          title="Guardar nueva contraseña"
          onPress={handleSubmit}
          loading={loading}
          icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
        />
      </View>
    </Screen>
  );
}
