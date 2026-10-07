import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { BrandMark } from './BrandMark';
import { ColorModeToggle } from './ColorModeToggle';
import { NavTabs } from './NavTabs';

/**
 * Top bar: ruled by a 1px divider, never shadowed. No user avatar in v1 (no login);
 * it comes back with accounts (Epic D).
 */
export function AppHeader() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 'none',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.standard,
          }),
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: 'auto', px: '26px', py: 2, gap: '20px' }}>
        <BrandMark />
        <Box sx={{ flexGrow: 1 }} />
        <NavTabs />
        <ColorModeToggle />
      </Toolbar>
    </AppBar>
  );
}
