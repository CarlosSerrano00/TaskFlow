import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import { Button, IconButton } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TasksContext';
import { getErrorMessage } from '@/utils/errors';
import { validatePassword, validatePasswordConfirmation } from '@/utils/validation';

const themeOptions: { key: 'light' | 'dark' | 'system'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'light', label: 'Claro', icon: 'sunny-outline' },
  { key: 'dark', label: 'Oscuro', icon: 'moon-outline' },
  { key: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
];

export default function ProfileScreen() {
  const {
    user,
    displayName,
    email,
    initials,
    signOut,
    changePassword,
    updatePassword,
  } = useAuth();
  const { stats } = useTasks();
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? 'system' : theme;

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const hasEmailIdentity = user?.identities?.some((identity) => identity.provider === 'email') ?? false;
  const hasPassword = hasEmailIdentity || providers.includes('email');
  const isGoogle = providers.includes('google') || user?.app_metadata?.provider === 'google';

  function resetForm() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setErrors({});
    setFormError(null);
  }

  function handleToggleForm() {
    setShowPasswordForm((current) => !current);
    setSuccess(null);
    setFormError(null);
  }

  async function handleChangePassword() {
    setFormError(null);
    setSuccess(null);

    const nextErrors: Record<string, string | null> = {
      current: hasPassword && !currentPassword ? 'Escribe tu contraseña actual.' : null,
      newPassword: validatePassword(newPassword),
      confirmation: validatePasswordConfirmation(newPassword, confirmation),
    };

    if (hasPassword && currentPassword && currentPassword === newPassword) {
      nextErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual.';
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      if (hasPassword) {
        await changePassword(currentPassword, newPassword);
        setSuccess('Tu contraseña se actualizó correctamente.');
      } else {
        await updatePassword(newPassword);
        setSuccess('Contraseña creada. Ahora también puedes iniciar sesión con tu correo.');
      }
      resetForm();
      setShowPasswordForm(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLogoutError(null);
    setLoggingOut(true);
    try {
      await signOut();
      setLogoutVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      setLogoutError(getErrorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Screen contentClassName="pb-28">
      <View className="mb-6 flex-row items-center justify-between">
        <Logo />
        <View className="rounded-full border border-success/20 bg-success-soft px-3 py-1.5">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-success">
            Sesión activa
          </Text>
        </View>
      </View>

      <View className="mb-6 items-center gap-3 rounded-3xl border border-border bg-surface p-6">
        <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-primary">
          <Text className="text-2xl font-extrabold text-white">{initials}</Text>
        </View>
        <View className="items-center gap-1">
          <Text className="text-center text-2xl font-extrabold tracking-tight text-foreground">
            {displayName}
          </Text>
          <Text className="text-center text-sm text-foreground-muted">{email}</Text>
        </View>
        <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5">
          <Ionicons
            name={isGoogle ? 'logo-google' : 'mail-outline'}
            size={14}
            color={isGoogle ? '#DB4437' : '#5B5BD6'}
          />
          <Text className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
            {isGoogle ? 'Cuenta de Google' : 'Correo y contraseña'}
          </Text>
        </View>
      </View>

      <View className="mb-6 flex-row gap-3">
        <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-2xl font-extrabold text-foreground">{stats.total}</Text>
          <Text className="text-[11px] font-semibold text-foreground-muted">Tareas</Text>
        </View>
        <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-2xl font-extrabold text-warning">{stats.pending}</Text>
          <Text className="text-[11px] font-semibold text-foreground-muted">Pendientes</Text>
        </View>
        <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-2xl font-extrabold text-success">{stats.completed}</Text>
          <Text className="text-[11px] font-semibold text-foreground-muted">Hechas</Text>
        </View>
      </View>

      {success ? (
        <View className="mb-4">
          <FeedbackBanner tone="success" message={success} onDismiss={() => setSuccess(null)} />
        </View>
      ) : null}
      {logoutError ? (
        <View className="mb-4">
          <FeedbackBanner tone="error" message={logoutError} onDismiss={() => setLogoutError(null)} />
        </View>
      ) : null}

      <View className="mb-6 gap-3 rounded-3xl border border-border bg-surface p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft">
            <Ionicons name="color-palette-outline" size={21} color="#5B5BD6" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-foreground">Apariencia</Text>
            <Text className="text-xs text-foreground-muted">Elige cómo se ve TaskFlow.</Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          {themeOptions.map((option) => {
            const active = activeTheme === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => Uniwind.setTheme(option.key)}
                className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border ${
                  active ? 'border-primary bg-primary-soft' : 'border-border bg-surface active:opacity-80'
                }`}>
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={active ? '#5B5BD6' : '#9BA1B5'}
                />
                <Text
                  className={`text-xs font-bold ${active ? 'text-primary' : 'text-foreground-muted'}`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mb-6 gap-4 rounded-3xl border border-border bg-surface p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
            <Ionicons name="lock-closed-outline" size={21} color="#0D9488" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-foreground">Seguridad</Text>
            <Text className="text-xs leading-4 text-foreground-muted">
              {hasPassword
                ? 'Verifica tu contraseña actual para cambiarla.'
                : 'Tu cuenta de Google aún no tiene contraseña. Puedes crear una.'}
            </Text>
          </View>
          <IconButton
            icon={showPasswordForm ? 'chevron-up' : 'create-outline'}
            accessibilityLabel={showPasswordForm ? 'Cerrar formulario' : 'Cambiar contraseña'}
            tone="primary"
            onPress={handleToggleForm}
          />
        </View>

        {showPasswordForm ? (
          <View className="gap-4 border-t border-border pt-4">
            {formError ? (
              <FeedbackBanner tone="error" message={formError} onDismiss={() => setFormError(null)} />
            ) : null}

            {hasPassword ? (
              <TextField
                label="Contraseña actual"
                value={currentPassword}
                onChangeText={(value) => {
                  setCurrentPassword(value);
                  if (errors.current) setErrors((current) => ({ ...current, current: null }));
                }}
                placeholder="Tu contraseña actual"
                icon="lock-closed-outline"
                isPassword
                autoComplete="current-password"
                textContentType="password"
                error={errors.current}
              />
            ) : null}

            <TextField
              label={hasPassword ? 'Nueva contraseña' : 'Crear contraseña'}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                if (errors.newPassword) setErrors((current) => ({ ...current, newPassword: null }));
              }}
              placeholder="Mínimo 8 caracteres"
              icon="key-outline"
              isPassword
              autoComplete="new-password"
              textContentType="newPassword"
              error={errors.newPassword}
            />

            <TextField
              label="Confirmar contraseña"
              value={confirmation}
              onChangeText={(value) => {
                setConfirmation(value);
                if (errors.confirmation) {
                  setErrors((current) => ({ ...current, confirmation: null }));
                }
              }}
              placeholder="Repite la contraseña"
              icon="shield-checkmark-outline"
              isPassword
              autoComplete="new-password"
              textContentType="newPassword"
              error={errors.confirmation}
            />

            <Button
              title={hasPassword ? 'Guardar nueva contraseña' : 'Crear contraseña'}
              onPress={handleChangePassword}
              loading={saving}
            />
          </View>
        ) : (
          <Button
            title={hasPassword ? 'Cambiar contraseña' : 'Crear contraseña'}
            variant="secondary"
            onPress={() => setShowPasswordForm(true)}
          />
        )}
      </View>

      <View className="mb-6 gap-3 rounded-3xl border border-border bg-surface p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted">
            <Ionicons name="person-circle-outline" size={22} color="#6B7080" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-foreground">Detalles de la cuenta</Text>
            <Text className="text-xs text-foreground-muted">Información gestionada por Supabase.</Text>
          </View>
        </View>

        <View className="gap-2 border-t border-border pt-3">
          <InfoRow label="Nombre" value={displayName} />
          <InfoRow label="Correo" value={email} />
          <InfoRow label="Método" value={isGoogle ? 'Google OAuth' : 'Correo y contraseña'} />
          <InfoRow label="Sesión" value="Persistente en este dispositivo" />
        </View>
      </View>

      <Button
        title="Cerrar sesión"
        variant="danger"
        onPress={() => setLogoutVisible(true)}
        icon={<Ionicons name="log-out-outline" size={18} color="#DC2626" />}
      />

      <Text className="mt-6 text-center text-[11px] leading-4 text-foreground-muted">
        TaskFlow · Gestión personal de tareas{'\n'}Construido con Expo SDK 57, Supabase, Uniwind y Lottie.
      </Text>

      <ConfirmModal
        visible={logoutVisible}
        title="Cerrar sesión"
        message="¿Quieres salir de tu cuenta? Tus tareas seguirán guardadas en Supabase."
        confirmLabel="Cerrar sesión"
        loading={loggingOut}
        onConfirm={() => {
          void handleLogout();
        }}
        onCancel={() => {
          if (!loggingOut) setLogoutVisible(false);
        }}
      />
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 py-1">
      <Text className="text-xs font-semibold text-foreground-muted">{label}</Text>
      <Text className="max-w-[65%] text-right text-xs font-bold text-foreground">{value}</Text>
    </View>
  );
}
