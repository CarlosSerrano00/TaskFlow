import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/button';
import type { Task } from '@/types/task';
import { formatTaskDate } from '@/utils/date';

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  compact = false,
  busy = false,
}: {
  task: Task;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
  busy?: boolean;
}) {
  return (
    <View
      className={`rounded-3xl border border-border bg-surface p-4 ${
        task.estado ? 'opacity-90' : ''
      }`}>
      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.estado, disabled: busy }}
          accessibilityLabel={task.estado ? 'Marcar como pendiente' : 'Marcar como completada'}
          onPress={onToggle}
          disabled={busy}
          hitSlop={8}
          className={`mt-0.5 h-7 w-7 items-center justify-center rounded-full border-2 active:opacity-70 ${
            task.estado ? 'border-success bg-success' : 'border-border bg-surface'
          } ${busy ? 'opacity-50' : ''}`}>
          {task.estado ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
        </Pressable>

        <View className="flex-1 gap-1">
          <Text
            numberOfLines={2}
            className={`text-base font-bold leading-5 text-foreground ${
              task.estado ? 'text-foreground-muted line-through' : ''
            }`}>
            {task.titulo}
          </Text>

          {task.descripcion ? (
            <Text numberOfLines={compact ? 1 : 2} className="text-sm leading-5 text-foreground-muted">
              {task.descripcion}
            </Text>
          ) : null}

          <View className="mt-1 flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={13} color="#9BA1B5" />
              <Text className="text-[11px] font-medium text-foreground-muted">
                {formatTaskDate(task.created_at)}
              </Text>
            </View>

            <View
              className={`rounded-full px-2 py-0.5 ${
                task.estado ? 'bg-success-soft' : 'bg-warning-soft'
              }`}>
              <Text
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  task.estado ? 'text-success' : 'text-warning'
                }`}>
                {task.estado ? 'Completada' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>

        {!compact && (onEdit || onDelete) ? (
          <View className="flex-row gap-2">
            {onEdit ? (
              <IconButton
                icon="create-outline"
                accessibilityLabel="Editar tarea"
                tone="primary"
                onPress={onEdit}
              />
            ) : null}
            {onDelete ? (
              <IconButton
                icon="trash-outline"
                accessibilityLabel="Eliminar tarea"
                tone="danger"
                onPress={onDelete}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
