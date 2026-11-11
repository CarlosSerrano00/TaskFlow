import { supabase } from '@/lib/supabase';
import { getTaskErrorMessage } from '@/utils/errors';
import type { Task, TaskInput, TaskUpdate } from '@/types/task';

const TABLE = 'tareas';

export class TaskServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskServiceError';
  }
}

function fail(error: unknown): never {
  throw new TaskServiceError(getTaskErrorMessage(error as Parameters<typeof getTaskErrorMessage>[0]));
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) fail(error);
  return (data ?? []) as Task[];
}

export async function createTask(userId: string, input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      titulo: input.titulo.trim(),
      descripcion: input.descripcion?.trim() || null,
      estado: false,
    })
    .select()
    .single();

  if (error) fail(error);
  return data as Task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: TaskUpdate,
): Promise<Task> {
  const payload: Record<string, unknown> = {};

  if (updates.titulo !== undefined) payload.titulo = updates.titulo.trim();
  if (updates.descripcion !== undefined) {
    payload.descripcion = updates.descripcion?.trim() || null;
  }
  if (updates.estado !== undefined) payload.estado = updates.estado;

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) fail(error);
  return data as Task;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) fail(error);
}
