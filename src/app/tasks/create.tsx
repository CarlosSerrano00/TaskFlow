import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Animation } from '@/components/ui/animation';
import { Button, IconButton } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useTasks } from '@/contexts/TasksContext';
import { getTaskErrorMessage } from '@/utils/errors';
import { validateTaskDescription, validateTaskTitle } from '@/utils/validation';

export default function CreateTaskScreen() {
  const { createTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

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
      await createTask({ titulo: title, descripcion: description });
      setCreated(true);
    } catch (error) {
      setFormError(getTaskErrorMessage(error as Parameters<typeof getTaskErrorMessage>[0]));
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <Screen contentClassName="justify-center pb-16">
        <View className="items-center gap-4">
          <Animation name="success" size={180} loop={false} />
          <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Tarea creada
          </Text>
          <Text className="max-w-[300px] text-center text-base leading-6 text-foreground-muted">
            Ya está en tu lista de pendientes. Puedes editarla o marcarla como completada cuando
            quieras.
          </Text>
          <View className="mt-4 w-full gap-3">
            <Button title="Volver a mis tareas" onPress={() => router.back()} />
            <Button
              title="Crear otra tarea"
              variant="secondary"
              onPress={() => {
                setTitle('');
                setDescription('');
                setCreated(false);
              }}
            />
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
          <Text className="text-lg font-extrabold tracking-tight text-foreground">Nueva tarea</Text>
          <Text className="text-xs text-foreground-muted">Captura la idea antes de que se escape.</Text>
        </View>
      </View>

      <View className="mb-6 flex-row items-center gap-3 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3">
        <Ionicons name="bulb-outline" size={20} color="#5B5BD6" />
        <Text className="flex-1 text-xs leading-4 text-primary">
          Un buen título empieza con un verbo: “Enviar informe”, “Llamar al cliente”…
        </Text>
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

        <View className="flex-row items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
          <Ionicons name="time-outline" size={16} color="#9BA1B5" />
          <Text className="text-xs font-medium text-foreground-muted">
            La tarea se creará como pendiente.
          </Text>
        </View>

        <Button
          title="Crear tarea"
          onPress={handleSubmit}
          loading={saving}
          icon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />}
        />
      </View>
    </Screen>
  );
}
