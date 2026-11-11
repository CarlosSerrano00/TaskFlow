export type Task = {
  id: string;
  user_id: string;
  titulo: string;
  descripcion: string | null;
  estado: boolean;
  created_at: string;
};

export type TaskInput = {
  titulo: string;
  descripcion?: string | null;
};

export type TaskUpdate = Partial<TaskInput> & {
  estado?: boolean;
};

export type TaskFilter = 'all' | 'pending' | 'completed';
