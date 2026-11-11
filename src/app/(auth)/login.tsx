import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, LinkButton } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Animation } from '@/components/ui/animation';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/contexts/AuthContext';
import { AuthFlowCancelledError, getErrorMessage } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = password ? null : 'Escribe tu contraseña.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (!(error instanceof AuthFlowCancelledError)) {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Screen scroll keyboard contentClassName="pb-14">
      <View className="mb-6 flex-row items-center justify-between">
        <Logo />
        <View className="rounded-full border border-border bg-surface px-3 py-1.5">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
            Bienvenido
          </Text>
        </View>
      </View>

      <View className="mb-2 gap-2">
        <Text className="text-4xl font-extrabold leading-[44px] tracking-tight text-foreground">
          Tu día,{'\n'}
          <Text className="text-primary">en orden.</Text>
        </Text>
        <Text className="max-w-[320px] text-base leading-6 text-foreground-muted">
          Inicia sesión para retomar tus tareas y mantener tu progreso al día.
        </Text>
      </View>

      <Animation name="welcome" size={150} speed={0.85} style={{ alignSelf: 'center' }} />

      <View className="gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        {formError ? <FeedbackBanner tone="error" message={formError} onDismiss={() => setFormError(null)} /> : null}

        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (emailError) setEmailError(null);
          }}
          placeholder="tu@correo.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={emailError}
        />

        <TextField
          label="Contraseña"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (passwordError) setPasswordError(null);
          }}
          placeholder="Tu contraseña"
          icon="lock-closed-outline"
          isPassword
          autoComplete="current-password"
          textContentType="password"
          error={passwordError}
        />

        <View className="-mt-1 flex-row justify-end">
          <LinkButton label="¿Olvidaste tu contraseña?" onPress={() => router.push('/(auth)/forgot-password')} />
        </View>

        <Button
          title="Iniciar sesión"
          onPress={handleSubmit}
          loading={loading}
          disabled={googleLoading}
          icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">
            o continúa con
          </Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuar con Google"
          onPress={handleGoogle}
          disabled={googleLoading || loading}
          className={`h-14 w-full flex-row items-center justify-center gap-3 rounded-2xl border border-border bg-surface active:opacity-80 ${
            googleLoading || loading ? 'opacity-50' : ''
          }`}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text className="text-base font-bold text-foreground">
            {googleLoading ? 'Conectando…' : 'Continuar con Google'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-foreground-muted">¿No tienes una cuenta?</Text>
        <LinkButton label="Crear cuenta" onPress={() => router.push('/(auth)/register')} />
      </View>

      <Text className="mt-6 text-center text-[11px] leading-4 text-foreground-muted">
        Al continuar aceptas que TaskFlow guarde tu sesión de forma segura en este dispositivo.
      </Text>
    </Screen>
  );
}
