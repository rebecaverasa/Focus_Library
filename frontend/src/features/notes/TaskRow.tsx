import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Check, X } from 'lucide-react';
import type { Task } from '@/api/tasks';
import { taskMeta } from './taskState';

interface TaskRowProps {
  task: Task;
  /** Bound to the timer (FL-10); not persisted, so the list passes false for now. */
  active?: boolean;
  onToggle: (task: Task) => void;
  onRemove: (task: Task) => void;
}

export function TaskRow({ task, active = false, onToggle, onRemove }: TaskRowProps) {
  const { done } = task;
  return (
    <Box
      component="li"
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        gap: { xs: '8px', sm: '13px' },
        minHeight: 64,
        p: { xs: '8px 4px 8px 4px', sm: '8px 12px 8px 6px' },
        borderRadius: '14px',
        border: '1px solid',
        borderColor: active ? 'primary.main' : done ? 'transparent' : t.palette.divider,
        bgcolor: active ? 'primary.light' : done ? 'transparent' : t.palette.background.paper,
      })}
    >
      {/* 44px hit area around the 22px visual circle */}
      <ButtonBase
        role="checkbox"
        aria-checked={done}
        aria-label={`${done ? 'Mark as not done' : 'Mark as done'}: ${task.title}`}
        onClick={() => onToggle(task)}
        sx={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }}
      >
        <Box
          sx={(t) => ({
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: '1.5px solid',
            // 3:1 against the row (WCAG 1.4.11): the hairline divider is too faint for a control.
            borderColor: done ? 'success.main' : alpha(t.palette.text.secondary, 0.75),
            bgcolor: done ? 'success.main' : 'transparent',
            color: 'success.contrastText',
            display: 'grid',
            placeItems: 'center',
            transition: 'background-color 420ms cubic-bezier(0.4,0,0.2,1)',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          })}
        >
          {done && <Check size={13} strokeWidth={2.4} aria-hidden />}
        </Box>
      </ButtonBase>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 15.5,
            lineHeight: 1.35,
            overflowWrap: 'anywhere',
            textDecoration: done ? 'line-through' : 'none',
            color: done ? 'text.secondary' : 'text.primary',
          }}
        >
          {task.title}
        </Typography>
        <Typography
          sx={{ fontSize: 11, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
        >
          {taskMeta(task)}
        </Typography>
      </Box>

      {/* FL-10 will make the pill a button that binds the task to the timer. */}
      <Chip
        label={done ? 'Done' : active ? 'In focus' : 'Focus'}
        size="small"
        variant={active ? 'filled' : 'outlined'}
        sx={(t) => ({
          flexShrink: 0,
          fontWeight: 600,
          fontSize: 12,
          ...(active && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
          ...(!active && { borderColor: t.palette.divider, color: 'text.secondary' }),
        })}
      />

      <IconButton
        aria-label={`Remove ${task.title}`}
        onClick={() => onRemove(task)}
        sx={{ width: 44, height: 44, flexShrink: 0, color: 'text.secondary' }}
      >
        <X size={16} strokeWidth={1.6} />
      </IconButton>
    </Box>
  );
}
