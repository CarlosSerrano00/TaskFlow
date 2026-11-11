import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  multiline?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  editable?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  onFocus?: () => void;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  icon,
  isPassword = false,
  multiline = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete,
  textContentType,
  editable = true,
  maxLength,
  onBlur,
  onFocus,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>

      <View
        className={`flex-row items-center gap-3 rounded-2xl border bg-surface px-4 ${
          multiline ? 'min-h-32 items-start py-4' : 'h-14'
        } ${error ? 'border-danger' : focused ? 'border-primary' : 'border-border'}`}>
        {icon ? (
          <Ionicons
            name={icon}
            size={19}
            color={error ? '#DC2626' : focused ? '#5B5BD6' : '#9BA1B5'}
            style={multiline ? { marginTop: 2 } : undefined}
          />
        ) : null}

        <TextInput
          className="flex-1 text-base text-foreground"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColorClassName="text-foreground-muted"
          secureTextEntry={isPassword && !visible}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={multiline ? { minHeight: 96 } : undefined}
        />

        {isPassword ? (
          <Text
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((current) => !current)}
            className="pl-1 text-xs font-bold text-primary">
            {visible ? 'Ocultar' : 'Mostrar'}
          </Text>
        ) : null}
      </View>

      {error ? (
        <Text className="text-xs font-medium text-danger">{error}</Text>
      ) : helper ? (
        <Text className="text-xs text-foreground-muted">{helper}</Text>
      ) : null}
    </View>
  );
}
