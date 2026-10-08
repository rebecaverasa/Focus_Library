import { http } from './http';

/** Mirrors the backend TaskRead schema. `date` is ISO YYYY-MM-DD; `mins` is logged focus time. */
export interface Task {
  id: string;
  title: string;
  date: string;
  done: boolean;
  mins: number;
  created_at: string;
  updated_at: string;
}

export interface TaskPatch {
  title?: string;
  done?: boolean;
  date?: string;
}

export async function listTasks(date: string): Promise<Task[]> {
  const { data } = await http.get<Task[]>('/tasks', { params: { date } });
  return data;
}

export async function createTask(input: { title: string; date: string }): Promise<Task> {
  const { data } = await http.post<Task>('/tasks', input);
  return data;
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  const { data } = await http.patch<Task>(`/tasks/${id}`, patch);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await http.delete(`/tasks/${id}`);
}

export interface TaskDayCount {
  date: string;
  count: number;
}

/** Days of a month (YYYY-MM) that hold notes; days without notes are omitted by the API. */
export async function listTaskDays(month: string): Promise<TaskDayCount[]> {
  const { data } = await http.get<TaskDayCount[]>('/tasks/days', { params: { month } });
  return data;
}
