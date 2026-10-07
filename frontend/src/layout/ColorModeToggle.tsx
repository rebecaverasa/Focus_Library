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
        width: 34,
        height: 34,
        border: 1,
        borderColor: 'divider',
        color: 'primary.main',
        '&:hover': { backgroundColor: 'hairline' },
      }}
    >
      <Icon size={18} strokeWidth={1.6} aria-hidden />
    </IconButton>
  );
}
