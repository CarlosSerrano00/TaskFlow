import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  testID?: string;
};

const containerClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-border',
  ghost: 'bg-transparent',
  danger: 'bg-danger-soft border border-danger/20',
  success: 'bg-success',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-foreground',
  ghost: 'text-primary',
  danger: 'text-danger',
  success: 'text-white',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className = '',
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      className={`h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl px-5 active:opacity-85 ${containerClasses[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#5B5BD6' : '#FFFFFF'} />
      ) : (
        <>
          {icon}
          <Text className={`text-base font-bold ${labelClasses[variant]}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'default' | 'danger' | 'primary';
  size?: number;
  disabled?: boolean;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  tone = 'default',
  size = 20,
  disabled = false,
}: IconButtonProps) {
  const toneClasses =
    tone === 'danger' ? 'bg-danger-soft' : tone === 'primary' ? 'bg-primary-soft' : 'bg-surface-muted';
  const color = tone === 'danger' ? '#DC2626' : tone === 'primary' ? '#5B5BD6' : '#6B7080';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      className={`h-10 w-10 items-center justify-center rounded-xl active:opacity-70 ${toneClasses} ${
        disabled ? 'opacity-40' : ''
      }`}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function LinkButton({
  label,
  onPress,
  className = '',
}: {
  label: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      hitSlop={8}
      className={`active:opacity-70 ${className}`}>
      <Text className="text-sm font-bold text-primary">{label}</Text>
    </Pressable>
  );
}
