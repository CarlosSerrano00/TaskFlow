import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, IconButton, LinkButton } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Animation } from '@/components/ui/animation';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    if (nextEmailError) return;

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <Animation name="success" size={180} loop={false} />
          <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Correo enviado
          </Text>
          <Text className="max-w-[330px] text-center text-base leading-6 text-foreground-muted">
            Si <Text className="font-bold text-foreground">{email.trim()}</Text> está registrado,
            recibirás un enlace para crear una nueva contraseña. Revisa también tu carpeta de spam.
          </Text>
          <View className="mt-4 w-full gap-3">
            <Button
              title="Volver a iniciar sesión"
              onPress={() => router.replace('/(auth)/login')}
            />
            <Button
              title="Enviar de nuevo"
              variant="secondary"
              onPress={() => setSent(false)}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard contentClassName="pb-14">
      <View className="mb-6 flex-row items-center gap-3">
        <IconButton icon="chevron-back" accessibilityLabel="Volver" onPress={() => router.back()} />
        <Text className="text-lg font-extrabold tracking-tight text-foreground">Recuperar acceso</Text>
      </View>

      <View className="mb-8 items-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft">
          <Ionicons name="key-outline" size={30} color="#5B5BD6" />
        </View>
        <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
          ¿Olvidaste tu contraseña?
        </Text>
        <Text className="max-w-[320px] text-center text-base leading-6 text-foreground-muted">
          Escribe el correo de tu cuenta y te enviaremos un enlace seguro para restablecerla.
        </Text>
      </View>

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

        <Button
          title="Enviar enlace de recuperación"
          onPress={handleSubmit}
          loading={loading}
          icon={<Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />}
        />
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-foreground-muted">¿Recordaste tu contraseña?</Text>
        <LinkButton label="Iniciar sesión" onPress={() => router.replace('/(auth)/login')} />
      </View>
    </Screen>
  );
}
