import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

/** Persistent header over the routed view. */
export function AppShell() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
