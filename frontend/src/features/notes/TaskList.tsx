import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';
import { TaskRow } from './TaskRow';
import { dayLabel, emptyDayName, leftCount } from './taskState';
import { useTasks } from './useTasks';

interface TaskListProps {
  /** ISO YYYY-MM-DD. Owned by the parent so the day picker (FL-8) can drive it. */
  date: string;
}

export function TaskList({ date }: TaskListProps) {
  const { query, add, toggle, remove } = useTasks(date);
  const [title, setTitle] = useState('');
  const tasks = query.data ?? [];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    add.mutate(clean, { onSuccess: () => setTitle('') });
  };

  return (
    <Box component="section" aria-labelledby="task-list-title" sx={{ minWidth: 0 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}
      >
        {/* FL-8 turns this heading into the day picker button. */}
        <Typography id="task-list-title" variant="h4" component="h2" sx={{ fontSize: 26 }}>
          {dayLabel(date)}
        </Typography>
        <Typography
          variant="caption"
          aria-live="polite"
          sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
        >
          {leftCount(tasks)} left
        </Typography>
      </Box>

      <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: '10px', mt: 2.5 }}>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          slotProps={{
            htmlInput: { 'aria-label': 'Add a task', maxLength: 200 },
            input: { sx: { borderRadius: '12px', bgcolor: 'background.paper', minHeight: 44 } },
          }}
        />
        <IconButton
          type="submit"
          aria-label="Add task"
          disabled={add.isPending}
          sx={(t) => ({
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'primary.main',
            bgcolor: 'primary.light',
            color: t.palette.mode === 'light' ? 'primary.dark' : 'primary.main',
          })}
        >
          <Plus size={16} strokeWidth={1.6} />
        </IconButton>
      </Box>

      {(query.isError || add.isError || toggle.isError || remove.isError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Something went wrong with your notes. Please try again.
        </Alert>
      )}

      {tasks.length === 0 && !query.isPending && !query.isError ? (
        <Box
          sx={{
            mt: 2.25,
            p: '24px 16px',
            textAlign: 'center',
            borderRadius: '13px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography color="textSecondary">
            No notes for {emptyDayName(date)}. Add the first one above.
          </Typography>
        </Box>
      ) : (
        <Box
          component="ul"
          aria-busy={query.isPending}
          sx={{ listStyle: 'none', m: 0, mt: 2.25, p: 0, display: 'grid', gap: '9px' }}
        >
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={(t) => toggle.mutate(t)}
              onRemove={(t) => remove.mutate(t)}
            />
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          mt: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }}
        />
        <Typography variant="caption" color="textSecondary">
          Completing a task ends its session and logs the minutes
        </Typography>
      </Box>
    </Box>
  );
}
