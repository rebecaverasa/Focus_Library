import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { listTaskDays } from '@/api/tasks';
import {
  keyDelta,
  monthWeeks,
  monthLabel,
  monthOf,
  parseISO,
  shiftDay,
  shiftMonth,
} from './calendarState';
import { dayLabel, todayISO } from './taskState';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
// DESIGN.md: below 720px the picker becomes a full-width Dialog.
const COMPACT = '(max-width:719.95px)';
// Touch tablets get 44px cells (and a wider popover) even above 720px.
const TOUCH = '(pointer: coarse)';

interface DayPickerProps {
  /** Selected ISO day. */
  date: string;
  onSelect: (date: string) => void;
}

/** The list heading doubles as the date control: label + tinted pill that opens the calendar. */
export function DayPicker({ date, onSelect }: DayPickerProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const compact = useMediaQuery(COMPACT);
  const touch = useMediaQuery(TOUCH);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const pick = (iso: string) => {
    onSelect(iso);
    close();
  };

  const body = <CalendarBody date={date} compact={compact || touch} onPick={pick} />;

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${dayLabel(date)}, change day`}
        sx={(t) => ({
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.25,
          minHeight: 44,
          borderRadius: '12px',
          textAlign: 'left',
          color: 'text.primary',
          '& .pill': {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            px: 1.25,
            py: 0.75,
            borderRadius: 999,
            bgcolor: 'primary.light',
            color: t.palette.mode === 'light' ? 'primary.dark' : 'primary.main',
          },
        })}
      >
        <Typography variant="h4" component="span" sx={{ fontSize: 26 }}>
          {dayLabel(date)}
        </Typography>
        <span className="pill" aria-hidden>
          <CalendarDays size={16} strokeWidth={1.6} />
          <ChevronDown size={14} strokeWidth={1.6} />
        </span>
      </ButtonBase>

      {compact ? (
        <Dialog
          open={open}
          onClose={close}
          slotProps={{
            paper: {
              'aria-label': 'Choose a day',
              sx: { m: 2, width: '100%', maxWidth: 400, borderRadius: '16px' },
            },
          }}
        >
          {body}
        </Dialog>
      ) : (
        <Popover
          open={open}
          anchorEl={anchor}
          onClose={close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              // Popover paper has no dialog role of its own.
              role: 'dialog',
              'aria-label': 'Choose a day',
              sx: { width: touch ? 344 : 286, mt: 1, borderRadius: '16px', boxShadow: 3 },
            },
          }}
        >
          {body}
        </Popover>
      )}
    </>
  );
}

interface CalendarBodyProps {
  date: string;
  compact: boolean;
  onPick: (date: string) => void;
}

function CalendarBody({ date, compact, onPick }: CalendarBodyProps) {
  const today = todayISO();
  const [month, setMonth] = useState(monthOf(date));
  // Roving tabindex target; starts on the selected day.
  const [focused, setFocused] = useState(date);
  const moved = useRef(false);

  // Dots: counts for the visible month; a failed request just means no dots.
  const days = useQuery({ queryKey: ['task-days', month], queryFn: () => listTaskDays(month) });
  const withNotes = new Set((days.data ?? []).filter((d) => d.count > 0).map((d) => d.date));

  // Opening lands focus on the selected day so arrows work immediately.
  useEffect(() => {
    document.getElementById(`day-${date}`)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open (mount)
  }, []);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    document.getElementById(`day-${focused}`)?.focus();
  }, [focused, month]);

  // Keep exactly one tabbable cell in the month on screen.
  const tabbable = monthOf(focused) === month ? focused : `${month}-01`;

  const onKeyDown = (e: KeyboardEvent) => {
    const delta = keyDelta(e.key);
    if (delta === null) return;
    e.preventDefault();
    const next = shiftDay(tabbable, delta);
    moved.current = true;
    setFocused(next);
    setMonth(monthOf(next));
  };

  const size = compact ? 44 : 34;
  const arrow = compact ? 44 : 28;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <MonthArrow
          label="Previous month"
          size={arrow}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <ChevronLeft size={16} strokeWidth={1.6} />
        </MonthArrow>
        <Typography variant="h5" component="div" aria-live="polite" sx={{ fontSize: 14 }}>
          {monthLabel(month)}
        </Typography>
        <MonthArrow label="Next month" size={arrow} onClick={() => setMonth(shiftMonth(month, 1))}>
          <ChevronRight size={16} strokeWidth={1.6} />
        </MonthArrow>
      </Box>

      <Box
        role="grid"
        aria-label={monthLabel(month)}
        onKeyDown={onKeyDown}
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          justifyItems: 'center',
          rowGap: compact ? 0.5 : '3px',
        }}
      >
        {WEEKDAYS.map((w, i) => (
          <Typography
            key={i}
            variant="caption"
            aria-hidden
            sx={{ color: 'text.secondary', height: 28, lineHeight: '28px' }}
          >
            {w}
          </Typography>
        ))}
        {monthWeeks(month).map((week, w) => (
          // display: contents keeps the 7-column grid while exposing real ARIA rows.
          <Box key={w} role="row" sx={{ display: 'contents' }}>
            {week.map((iso, i) =>
              iso === null ? (
                <span key={`pad-${i}`} aria-hidden />
              ) : (
                <DayCell
                  key={iso}
                  iso={iso}
                  size={size}
                  selected={iso === date}
                  isToday={iso === today}
                  hasNotes={withNotes.has(iso)}
                  tabbable={iso === tabbable}
                  onPick={onPick}
                />
              ),
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 1.75,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="caption" color="textSecondary">
          A dot marks a day with notes
        </Typography>
        <ButtonBase
          onClick={() => onPick(today)}
          sx={(t) => ({
            minHeight: compact ? 44 : 28,
            position: 'relative',
            '&::after': { content: '""', position: 'absolute', inset: '-8px 0' },
            px: 1.75,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'primary.main',
            bgcolor: 'primary.light',
            color: t.palette.mode === 'light' ? 'primary.dark' : 'primary.main',
            fontFamily: t.typography.button.fontFamily,
            fontWeight: 600,
            fontSize: 12.5,
          })}
        >
          Today
        </ButtonBase>
      </Box>
    </Box>
  );
}

function MonthArrow(props: {
  label: string;
  size: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={props.label}
      onClick={props.onClick}
      sx={{
        width: props.size,
        height: props.size,
        borderRadius: '9px',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.secondary',
        // Mouse layout keeps the 28px button; the pseudo-element grows the click target to 44px.
        position: 'relative',
        '&::after': { content: '""', position: 'absolute', inset: -8 },
      }}
    >
      {props.children}
    </IconButton>
  );
}

interface DayCellProps {
  iso: string;
  size: number;
  selected: boolean;
  isToday: boolean;
  hasNotes: boolean;
  tabbable: boolean;
  onPick: (date: string) => void;
}

function DayCell({ iso, size, selected, isToday, hasNotes, tabbable, onPick }: DayCellProps) {
  const { d } = parseISO(iso);
  return (
    <ButtonBase
      id={`day-${iso}`}
      role="gridcell"
      tabIndex={tabbable ? 0 : -1}
      aria-selected={selected}
      aria-current={isToday ? 'date' : undefined}
      aria-label={`${dayLabel(iso, '')}${hasNotes ? ', has notes' : ''}`}
      onClick={() => onPick(iso)}
      sx={(t) => ({
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '10px',
        fontFamily: t.typography.button.fontFamily,
        fontSize: 13,
        fontVariantNumeric: 'tabular-nums',
        color: selected ? 'primary.contrastText' : 'text.primary',
        bgcolor: selected ? 'primary.main' : isToday ? 'primary.light' : 'transparent',
        fontWeight: selected ? 700 : 500,
        '&:hover': { bgcolor: selected ? 'primary.main' : 'action.hover' },
        '&::after': hasNotes
          ? {
              content: '""',
              position: 'absolute',
              bottom: 4,
              left: '50%',
              width: 4,
              height: 4,
              ml: '-2px',
              borderRadius: '50%',
              bgcolor: selected ? 'primary.contrastText' : 'primary.main',
            }
          : undefined,
      })}
    >
      {d}
    </ButtonBase>
  );
}
