import IconButton from '@mui/material/IconButton';
import { Moon, Sun } from 'lucide-react';
import { useColorMode } from '@/theme';

/** Day/night switch. Shows the current mode's icon; the label names the next one. */
export function ColorModeToggle() {
  const { mode, toggleMode } = useColorMode();
  const Icon = mode === 'day' ? Sun : Moon;

  return (
    <IconButton
      onClick={toggleMode}
      aria-label={mode === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
      sx={{
        width: { xs: 44, sm: 34 },
        flexShrink: 0,
        height: { xs: 44, sm: 34 },
        border: 1,
        borderColor: 'divider',
        color: 'primary.main',
        '&:hover': { backgroundColor: 'hairline' },
        // 34px visual from sm up, with a 44px clickable box.
        position: 'relative',
        '&::after': { content: '""', position: 'absolute', inset: { xs: 0, sm: -6 } },
      }}
    >
      <Icon size={18} strokeWidth={1.6} aria-hidden />
    </IconButton>
  );
}
