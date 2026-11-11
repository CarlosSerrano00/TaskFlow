import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { StatCard } from '@/components/stat-card';
import { TaskCard } from '@/components/task-card';
import { Animation } from '@/components/ui/animation';
import { Button, LinkButton } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { PageHeader, Screen } from '@/components/ui/screen';
import { usePalette } from '@/constants/palette';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TasksContext';
import { firstName, formatLongDate, getGreeting } from '@/utils/date';

export default function DashboardScreen() {
  const { displayName, initials } = useAuth();
  const { tasks, stats, loading, refreshing, error, refresh, clearError, toggleTask } = useTasks();
  const palette = usePalette();

  const recentTasks = tasks.slice(0, 4);

  return (
    <Screen
      contentClassName="pb-28"
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        ),
      }}>
      <View className="mb-6 flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-primary">
            {formatLongDate()}
          </Text>
          <Text className="mt-1 text-3xl font-extrabold leading-9 tracking-tight text-foreground">
            {getGreeting()}, {firstName(displayName)} 👋
          </Text>
          <Text className="mt-1 text-sm text-foreground-muted">Esto es lo que tienes para hoy.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          onPress={() => router.push('/(tabs)/profile')}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft active:opacity-80">
          <Text className="text-sm font-extrabold text-primary">{initials}</Text>
        </Pressable>
      </View>

      <View className="mb-6 overflow-hidden rounded-[28px] bg-primary p-5 shadow-lg">
        <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <View className="absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-white/5" />
        <View className="absolute right-16 top-16 h-10 w-10 rounded-full bg-accent/40" />

        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-white/70">
              Tu progreso
            </Text>
            <Text className="mt-1 text-5xl font-extrabold tracking-tight text-white">
              {stats.progress}%
            </Text>
            <Text className="mt-1 text-sm font-medium text-white/80">
              {stats.completed} de {stats.total} tareas completadas
            </Text>
          </View>

          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Ionicons name="trending-up" size={24} color="#FFFFFF" />
          </View>
        </View>

        <View className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/20">
          <View
            className="h-2.5 rounded-full bg-white"
            style={{ width: `${Math.max(stats.progress, 3)}%` }}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/tasks/create')}
          className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 active:opacity-80">
          <Ionicons name="add-circle-outline" size={19} color="#FFFFFF" />
          <Text className="text-sm font-bold text-white">Nueva tarea</Text>
        </Pressable>
      </View>

      <View className="mb-7 flex-row gap-2.5">
        <StatCard label="Total" value={stats.total} tone="primary" />
        <StatCard label="Pendientes" value={stats.pending} tone="warning" />
        <StatCard label="Hechas" value={stats.completed} tone="success" />
      </View>

      {error ? (
        <View className="mb-5 gap-2">
          <FeedbackBanner tone="error" message={error} onDismiss={clearError} />
          <LinkButton label="Reintentar" onPress={refresh} />
        </View>
      ) : null}

      <PageHeader
        eyebrow="Actividad"
        title="Tareas recientes"
        subtitle="Tus últimos movimientos, siempre a la vista."
        right={<LinkButton label="Ver todas" onPress={() => router.push('/(tabs)/tasks')} />}
      />

      {loading && tasks.length === 0 ? (
        <View className="items-center py-4">
          <Animation name="loading" size={150} />
          <Text className="text-sm font-medium text-foreground-muted">Cargando tus tareas…</Text>
        </View>
      ) : recentTasks.length === 0 ? (
        <View className="items-center gap-3 rounded-3xl border border-border bg-surface px-5 py-6">
          <Animation name="empty" size={150} />
          <Text className="text-lg font-extrabold text-foreground">Tu lista está lista</Text>
          <Text className="max-w-[280px] text-center text-sm leading-5 text-foreground-muted">
            Aún no tienes tareas. Crea la primera y empieza a avanzar.
          </Text>
          <View className="mt-1 w-full">
            <Button title="Crear mi primera tarea" onPress={() => router.push('/tasks/create')} />
          </View>
        </View>
      ) : (
        <View className="gap-3">
          {recentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              compact
              onToggle={() => {
                void toggleTask(task);
              }}
              onEdit={() => router.push({ pathname: '/tasks/edit', params: { id: task.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
