import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  fetchTasks,
  updateTask as updateTaskRequest,
} from '@/services/taskService';
import type { Task, TaskInput, TaskUpdate } from '@/types/task';
import { getTaskErrorMessage } from '@/utils/errors';

type TasksContextValue = {
  tasks: Task[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  stats: {
    total: number;
    completed: number;
    pending: number;
    progress: number;
  };
  refresh: () => Promise<void>;
  clearError: () => void;
  createTask: (input: TaskInput) => Promise<Task>;
  updateTask: (taskId: string, updates: TaskUpdate) => Promise<Task>;
  toggleTask: (task: Task) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function sortTasks(tasks: Task[]) {
  return [...tasks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function TasksProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (!userId) {
        setTasks([]);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);

      try {
        const data = await fetchTasks(userId);
        setTasks(sortTasks(data));
        setError(null);
      } catch (err) {
        setError(getTaskErrorMessage(err as Parameters<typeof getTaskErrorMessage>[0]));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    // Fetching from Supabase is the external synchronization this effect exists for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTasks('initial');
  }, [loadTasks]);

  const refresh = useCallback(async () => {
    await loadTasks('refresh');
  }, [loadTasks]);

  const clearError = useCallback(() => setError(null), []);

  const createTask = useCallback(
    async (input: TaskInput) => {
      if (!userId) throw new Error('Debes iniciar sesión para crear tareas.');
      const task = await createTaskRequest(userId, input);
      setTasks((current) => sortTasks([task, ...current]));
      setError(null);
      return task;
    },
    [userId],
  );

  const updateTask = useCallback(
    async (taskId: string, updates: TaskUpdate) => {
      if (!userId) throw new Error('Debes iniciar sesión para editar tareas.');
      const updated = await updateTaskRequest(userId, taskId, updates);
      setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)));
      setError(null);
      return updated;
    },
    [userId],
  );

  const toggleTask = useCallback(
    async (task: Task) => {
      if (!userId) throw new Error('Debes iniciar sesión para actualizar tareas.');
      const updated = await updateTaskRequest(userId, task.id, { estado: !task.estado });
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setError(null);
    },
    [userId],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!userId) throw new Error('Debes iniciar sesión para eliminar tareas.');
      await deleteTaskRequest(userId, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setError(null);
    },
    [userId],
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.estado).length;
    return {
      total,
      completed,
      pending: total - completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [tasks]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      loading,
      refreshing,
      error,
      stats,
      refresh,
      clearError,
      createTask,
      updateTask,
      toggleTask,
      removeTask,
    }),
    [
      tasks,
      loading,
      refreshing,
      error,
      stats,
      refresh,
      clearError,
      createTask,
      updateTask,
      toggleTask,
      removeTask,
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks debe usarse dentro de un TasksProvider.');
  }
  return context;
}
