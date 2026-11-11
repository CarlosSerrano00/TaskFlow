import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, Text, View } from 'react-native';

import { TaskCard } from '@/components/task-card';
import { Animation } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Screen } from '@/components/ui/screen';
import { usePalette } from '@/constants/palette';
import { useTasks } from '@/contexts/TasksContext';
import type { Task, TaskFilter } from '@/types/task';
import { getTaskErrorMessage } from '@/utils/errors';

const filters: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'completed', label: 'Completadas' },
];

export default function TasksScreen() {
  const { tasks, stats, loading, refreshing, error, refresh, clearError, toggleTask, removeTask } =
    useTasks();
  const palette = usePalette();

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sections = useMemo(() => {
    const pending = tasks.filter((task) => !task.estado);
    const completed = tasks.filter((task) => task.estado);

    if (filter === 'pending') return pending.length ? [{ title: 'Pendientes', data: pending }] : [];
    if (filter === 'completed') return completed.length ? [{ title: 'Completadas', data: completed }] : [];

    return [
      { title: 'Pendientes', data: pending },
      { title: 'Completadas', data: completed },
    ].filter((section) => section.data.length > 0);
  }, [filter, tasks]);

  async function handleToggle(task: Task) {
    setActionError(null);
    setBusyId(task.id);
    try {
      await toggleTask(task);
    } catch (err) {
      setActionError(getTaskErrorMessage(err as Parameters<typeof getTaskErrorMessage>[0]));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!taskToDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await removeTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch (err) {
      setActionError(getTaskErrorMessage(err as Parameters<typeof getTaskErrorMessage>[0]));
    } finally {
      setDeleting(false);
    }
  }

  const emptyCopy =
    filter === 'pending'
      ? { title: 'Sin pendientes', text: '¡Excelente! No te queda nada por hacer en este momento.' }
      : filter === 'completed'
        ? { title: 'Aún nada completado', text: 'Marca una tarea como completada y aparecerá aquí.' }
        : { title: 'Tu lista está vacía', text: 'Crea tu primera tarea para empezar a organizar tu día.' };

  return (
    <Screen scroll={false} contentClassName="px-0 pt-4">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="px-5 pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
        ListHeaderComponent={
          <View className="mb-5 gap-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[11px] font-bold uppercase tracking-[2px] text-primary">
                  Organiza tu día
                </Text>
                <Text className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                  Mis tareas
                </Text>
                <Text className="mt-1 text-sm text-foreground-muted">
                  {stats.pending} pendientes · {stats.completed} completadas
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Crear tarea"
                onPress={() => router.push('/tasks/create')}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-primary active:opacity-85">
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <View className="flex-row gap-2">
              {filters.map((item) => {
                const active = filter === item.key;
                const count =
                  item.key === 'all'
                    ? stats.total
                    : item.key === 'pending'
                      ? stats.pending
                      : stats.completed;

                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(item.key)}
                    className={`h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border ${
                      active
                        ? 'border-primary bg-primary'
                        : 'border-border bg-surface active:opacity-80'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${active ? 'text-white' : 'text-foreground-muted'}`}>
                      {item.label}
                    </Text>
                    <View
                      className={`rounded-full px-1.5 py-0.5 ${active ? 'bg-white/20' : 'bg-surface-muted'}`}>
                      <Text
                        className={`text-[10px] font-extrabold ${
                          active ? 'text-white' : 'text-foreground-muted'
                        }`}>
                        {count}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {error ? <FeedbackBanner tone="error" message={error} onDismiss={clearError} /> : null}
            {actionError ? (
              <FeedbackBanner tone="error" message={actionError} onDismiss={() => setActionError(null)} />
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="mb-3 mt-2 flex-row items-center gap-2">
            <Text className="text-sm font-extrabold uppercase tracking-wider text-foreground-muted">
              {section.title}
            </Text>
            <View className="rounded-full bg-surface-muted px-2 py-0.5">
              <Text className="text-[10px] font-extrabold text-foreground-muted">
                {section.data.length}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="mb-3">
            <TaskCard
              task={item}
              busy={busyId === item.id}
              onToggle={() => {
                void handleToggle(item);
              }}
              onEdit={() => router.push({ pathname: '/tasks/edit', params: { id: item.id } })}
              onDelete={() => setTaskToDelete(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center gap-3 rounded-3xl border border-border bg-surface px-5 py-8">
            {loading ? (
              <Animation name="loading" size={140} />
            ) : (
              <Animation name="empty" size={160} />
            )}
            <Text className="text-lg font-extrabold text-foreground">{emptyCopy.title}</Text>
            <Text className="max-w-[290px] text-center text-sm leading-5 text-foreground-muted">
              {emptyCopy.text}
            </Text>
            <View className="mt-1 w-full">
              <Button title="Nueva tarea" onPress={() => router.push('/tasks/create')} />
            </View>
          </View>
        }
      />

      <ConfirmModal
        visible={!!taskToDelete}
        title="Eliminar tarea"
        message={`¿Seguro que quieres eliminar “${taskToDelete?.titulo ?? ''}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          if (!deleting) setTaskToDelete(null);
        }}
      />
    </Screen>
  );
}
