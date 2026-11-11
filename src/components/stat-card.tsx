import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type Tone = 'primary' | 'warning' | 'success';

const toneStyles: Record<Tone, { icon: string; iconColor: string; bubble: string; value: string }> = {
  primary: { icon: 'layers-outline', iconColor: '#5B5BD6', bubble: 'bg-primary-soft', value: 'text-primary' },
  warning: { icon: 'hourglass-outline', iconColor: '#B45309', bubble: 'bg-warning-soft', value: 'text-warning' },
  success: { icon: 'checkmark-done-outline', iconColor: '#059669', bubble: 'bg-success-soft', value: 'text-success' },
};

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: Tone;
}) {
  const styles = toneStyles[tone];

  return (
    <View className="flex-1 gap-3 rounded-3xl border border-border bg-surface p-4">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${styles.bubble}`}>
        <Ionicons name={styles.icon as keyof typeof Ionicons.glyphMap} size={18} color={styles.iconColor} />
      </View>
      <View>
        <Text className={`text-2xl font-extrabold tracking-tight ${styles.value}`}>{value}</Text>
        <Text className="text-xs font-medium text-foreground-muted">{label}</Text>
      </View>
    </View>
  );
}
