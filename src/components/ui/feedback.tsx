import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export type FeedbackTone = 'error' | 'success' | 'info' | 'warning';

const toneContainer: Record<FeedbackTone, string> = {
  error: 'bg-danger-soft border-danger/20',
  success: 'bg-success-soft border-success/20',
  info: 'bg-primary-soft border-primary/20',
  warning: 'bg-warning-soft border-warning/20',
};

const toneText: Record<FeedbackTone, string> = {
  error: 'text-danger',
  success: 'text-success',
  info: 'text-primary',
  warning: 'text-warning',
};

const toneIcon: Record<FeedbackTone, keyof typeof Ionicons.glyphMap> = {
  error: 'alert-circle',
  success: 'checkmark-circle',
  info: 'information-circle',
  warning: 'warning',
};

export function FeedbackBanner({
  tone = 'error',
  message,
  onDismiss,
}: {
  tone?: FeedbackTone;
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <View className={`flex-row items-start gap-3 rounded-2xl border px-4 py-3 ${toneContainer[tone]}`}>
      <Ionicons name={toneIcon[tone]} size={20} color={toneTextColor(tone)} />
      <Text className={`flex-1 text-sm font-medium leading-5 ${toneText[tone]}`}>{message}</Text>
      {onDismiss ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar mensaje" onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={18} color={toneTextColor(tone)} />
        </Pressable>
      ) : null}
    </View>
  );
}

function toneTextColor(tone: FeedbackTone) {
  switch (tone) {
    case 'success':
      return '#059669';
    case 'info':
      return '#5B5BD6';
    case 'warning':
      return '#B45309';
    default:
      return '#DC2626';
  }
}
