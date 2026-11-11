import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Animation } from '@/components/ui/animation';
import { Button, IconButton } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useTasks } from '@/contexts/TasksContext';
import type { Task } from '@/types/task';
import { getTaskErrorMessage } from '@/utils/errors';
import { validateTaskDescription, validateTaskTitle } from '@/utils/validation';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, loading } = useTasks();

  const task = useMemo(() => tasks.find((item) => item.id === id), [id, tasks]);

  if (!task && loading) {
    return (
      <Screen contentClassName="items-center justify-center pb-16">
        <Animation name="loading" size={180} />
        <Text className="text-sm font-medium text-foreground-muted">Cargando la tarea…</Text>
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-danger-soft">
            <Ionicons name="alert-circle-outline" size={30} color="#DC2626" />
          </View>
          <Text className="text-center text-2xl font-extrabold text-foreground">
            Tarea no encontrada
          </Text>
          <Text className="max-w-[300px] text-center text-sm leading-5 text-foreground-muted">
            Puede que la tarea haya sido eliminada o que no tengas acceso a ella.
          </Text>
          <View className="mt-2 w-full">
            <Button title="Volver a mis tareas" onPress={() => router.back()} />
          </View>
        </View>
      </Screen>
    );
  }

  return <EditTaskForm key={task.id} task={task} />;
}

function EditTaskForm({ task }: { task: Task }) {
  const { updateTask, removeTask } = useTasks();

  // Initial values come from the task once, via the component key. No effect needed.
  const [title, setTitle] = useState(task.titulo);
  const [description, setDescription] = useState(task.descripcion ?? '');
  const [completed, setCompleted] = useState(task.estado);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const nextErrors = {
      title: validateTaskTitle(title),
      description: validateTaskDescription(description),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      await updateTask(task.id, {
        titulo: title,
        descripcion: description,
        estado: completed,
      });
      setSaved(true);
    } catch (error) {
      setFormError(getTaskErrorMessage(error as Parameters<typeof getTaskErrorMessage>[0]));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setFormError(null);
    try {
      await removeTask(task.id);
      setDeleteVisible(false);
      router.back();
    } catch (error) {
      setFormError(getTaskErrorMessage(error as Parameters<typeof getTaskErrorMessage>[0]));
      setDeleteVisible(false);
    } finally {
      setDeleting(false);
    }
  }

  if (saved) {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <Animation name="success" size={180} loop={false} />
          <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Cambios guardados
          </Text>
          <Text className="max-w-[300px] text-center text-base leading-6 text-foreground-muted">
            La tarea se actualizó correctamente en Supabase.
          </Text>
          <View className="mt-4 w-full">
            <Button title="Volver a mis tareas" onPress={() => router.back()} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard contentClassName="pb-14">
      <View className="mb-6 flex-row items-center gap-3">
        <IconButton icon="close" accessibilityLabel="Cerrar" onPress={() => router.back()} />
        <View className="flex-1">
          <Text className="text-lg font-extrabold tracking-tight text-foreground">Editar tarea</Text>
          <Text className="text-xs text-foreground-muted">Actualiza los detalles o su estado.</Text>
        </View>
        <IconButton
          icon="trash-outline"
          accessibilityLabel="Eliminar tarea"
          tone="danger"
          onPress={() => setDeleteVisible(true)}
        />
      </View>

      <View className="gap-4 rounded-3xl border border-border bg-surface p-5">
        {formError ? (
          <FeedbackBanner tone="error" message={formError} onDismiss={() => setFormError(null)} />
        ) : null}

        <TextField
          label="Título de la tarea"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (errors.title) setErrors((current) => ({ ...current, title: null }));
          }}
          placeholder="¿Qué necesitas hacer?"
          icon="create-outline"
          autoCapitalize="sentences"
          maxLength={120}
          error={errors.title}
        />

        <View className="gap-2">
          <TextField
            label="Descripción (opcional)"
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              if (errors.description) {
                setErrors((current) => ({ ...current, description: null }));
              }
            }}
            placeholder="Agrega detalles, contexto o un recordatorio…"
            icon="document-text-outline"
            autoCapitalize="sentences"
            multiline
            maxLength={600}
            error={errors.description}
          />
          <Text className="text-right text-[11px] font-medium text-foreground-muted">
            {description.length}/600
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Estado</Text>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !completed }}
              onPress={() => setCompleted(false)}
              className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${
                !completed
                  ? 'border-warning bg-warning-soft'
                  : 'border-border bg-surface active:opacity-80'
              }`}>
              <Ionicons
                name="hourglass-outline"
                size={17}
                color={!completed ? '#B45309' : '#9BA1B5'}
              />
              <Text
                className={`text-sm font-bold ${!completed ? 'text-warning' : 'text-foreground-muted'}`}>
                Pendiente
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: completed }}
              onPress={() => setCompleted(true)}
              className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${
                completed
                  ? 'border-success bg-success-soft'
                  : 'border-border bg-surface active:opacity-80'
              }`}>
              <Ionicons
                name="checkmark-done-outline"
                size={17}
                color={completed ? '#059669' : '#9BA1B5'}
              />
              <Text
                className={`text-sm font-bold ${completed ? 'text-success' : 'text-foreground-muted'}`}>
                Completada
              </Text>
            </Pressable>
          </View>
        </View>

        <Button
          title="Guardar cambios"
          onPress={handleSubmit}
          loading={saving}
          icon={<Ionicons name="save-outline" size={18} color="#FFFFFF" />}
        />
      </View>

      <ConfirmModal
        visible={deleteVisible}
        title="Eliminar tarea"
        message={`¿Seguro que quieres eliminar “${task.titulo}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          if (!deleting) setDeleteVisible(false);
        }}
      />
    </Screen>
  );
}
