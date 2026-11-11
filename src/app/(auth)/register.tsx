import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, IconButton, LinkButton } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Animation } from '@/components/ui/animation';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/errors';
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordConfirmation,
} from '@/utils/validation';

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    if (!password) return 0;
    let value = 0;
    if (password.length >= 8) value += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) value += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) value += 1;
    return value;
  }, [password]);

  const labels = ['', 'Básica', 'Buena', 'Excelente'];
  const colors = ['bg-border', 'bg-danger', 'bg-warning', 'bg-success'];

  if (!password) return null;

  return (
    <View className="gap-1.5">
      <View className="flex-row gap-1.5">
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            className={`h-1.5 flex-1 rounded-full ${step <= score ? colors[score] : 'bg-border'}`}
          />
        ))}
      </View>
      <Text className="text-[11px] font-medium text-foreground-muted">
        Seguridad: <Text className="font-bold text-foreground">{labels[score]}</Text>
      </Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function updateField(field: string, value: string, setter: (next: string) => void) {
    setter(value);
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: null }));
    }
  }

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const result = await signUp(fullName, email, password);
      if (result.needsConfirmation) {
        setConfirmationSent(true);
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <Animation name="success" size={190} loop={false} />
          <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Revisa tu correo
          </Text>
          <Text className="max-w-[330px] text-center text-base leading-6 text-foreground-muted">
            Enviamos un enlace de confirmación a{' '}
            <Text className="font-bold text-foreground">{email.trim()}</Text>. Ábrelo para activar tu
            cuenta y luego inicia sesión.
          </Text>
          <View className="mt-4 w-full gap-3">
            <Button title="Ir a iniciar sesión" onPress={() => router.replace('/(auth)/login')} />
            <Button
              title="Usar otro correo"
              variant="secondary"
              onPress={() => setConfirmationSent(false)}
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
        <Text className="text-lg font-extrabold tracking-tight text-foreground">Crear cuenta</Text>
      </View>

      <View className="mb-6 gap-2">
        <Text className="text-4xl font-extrabold leading-[44px] tracking-tight text-foreground">
          Empieza a fluir.
        </Text>
        <Text className="text-base leading-6 text-foreground-muted">
          Crea tu cuenta y convierte tus pendientes en pequeños logros.
        </Text>
      </View>

      <View className="gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        {formError ? <FeedbackBanner tone="error" message={formError} onDismiss={() => setFormError(null)} /> : null}

        <TextField
          label="Nombre completo"
          value={fullName}
          onChangeText={(value) => updateField('fullName', value, setFullName)}
          placeholder="Ada Lovelace"
          icon="person-outline"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          error={errors.fullName}
        />

        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={(value) => updateField('email', value, setEmail)}
          placeholder="tu@correo.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email}
        />

        <View className="gap-2">
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={(value) => updateField('password', value, setPassword)}
            placeholder="Mínimo 8 caracteres"
            icon="lock-closed-outline"
            isPassword
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password}
          />
          <PasswordStrength password={password} />
        </View>

        <TextField
          label="Confirmar contraseña"
          value={confirmation}
          onChangeText={(value) => updateField('confirmation', value, setConfirmation)}
          placeholder="Repite tu contraseña"
          icon="shield-checkmark-outline"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.confirmation}
        />

        <Button
          title="Crear mi cuenta"
          onPress={handleSubmit}
          loading={loading}
          icon={<Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />}
        />

        <Text className="text-center text-[11px] leading-4 text-foreground-muted">
          Tu nombre se guarda como metadato de la cuenta y tus tareas quedan protegidas por las
          políticas de seguridad de Supabase.
        </Text>
      </View>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-foreground-muted">¿Ya tienes cuenta?</Text>
        <LinkButton label="Iniciar sesión" onPress={() => router.replace('/(auth)/login')} />
      </View>
    </Screen>
  );
}
