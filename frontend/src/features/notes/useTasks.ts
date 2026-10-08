import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, listTasks, updateTask, type Task } from '@/api/tasks';

export const tasksKey = (date: string) => ['tasks', date] as const;

export function useTasks(date: string) {
  const client = useQueryClient();
  const key = tasksKey(date);

  // The FL-8 day dots will read per-month counts, so refresh those too.
  const settle = () => {
    void client.invalidateQueries({ queryKey: key });
    void client.invalidateQueries({ queryKey: ['task-days'] });
  };

  // Optimistic edit of the cached list; rolled back if the request fails.
  const optimistic = async (edit: (tasks: Task[]) => Task[]) => {
    await client.cancelQueries({ queryKey: key });
    const previous = client.getQueryData<Task[]>(key);
    if (previous) client.setQueryData<Task[]>(key, edit(previous));
    return { previous };
  };
  const rollback = (_e: unknown, _v: unknown, ctx?: { previous?: Task[] }) => {
    if (ctx?.previous) client.setQueryData(key, ctx.previous);
  };

  const query = useQuery({ queryKey: key, queryFn: () => listTasks(date) });

  const add = useMutation({
    mutationFn: (title: string) => createTask({ title, date }),
    onSettled: settle,
  });

  const toggle = useMutation({
    mutationFn: (task: Task) => updateTask(task.id, { done: !task.done }),
    onMutate: (task) =>
      optimistic((ts) => ts.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))),
    onError: rollback,
    onSettled: settle,
  });

  const remove = useMutation({
    mutationFn: (task: Task) => deleteTask(task.id),
    onMutate: (task) => optimistic((ts) => ts.filter((t) => t.id !== task.id)),
    onError: rollback,
    onSettled: settle,
  });

  return { query, add, toggle, remove };
}
