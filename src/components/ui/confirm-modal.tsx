import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmClass = tone === 'danger' ? 'bg-danger' : 'bg-primary';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-overlay px-6">
        <View className="w-full max-w-md gap-4 rounded-3xl border border-border bg-surface p-6 shadow-xl">
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${
              tone === 'danger' ? 'bg-danger-soft' : 'bg-primary-soft'
            }`}>
            <Ionicons
              name={tone === 'danger' ? 'trash-outline' : 'help-circle-outline'}
              size={24}
              color={tone === 'danger' ? '#DC2626' : '#5B5BD6'}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xl font-extrabold tracking-tight text-foreground">{title}</Text>
            <Text className="text-sm leading-5 text-foreground-muted">{message}</Text>
          </View>

          <View className="mt-2 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              disabled={loading}
              className="h-12 flex-1 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-80">
              <Text className="text-sm font-bold text-foreground">{cancelLabel}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              disabled={loading}
              className={`h-12 flex-1 items-center justify-center rounded-2xl active:opacity-85 ${confirmClass} ${
                loading ? 'opacity-60' : ''
              }`}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-sm font-bold text-white">{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
