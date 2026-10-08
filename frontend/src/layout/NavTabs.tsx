import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { navItems } from './navItems';

/** Header navigation: route links rendered as tabs; the active one is a tinted pill. */
export function NavTabs() {
  const { pathname } = useLocation();
  // Derive the active tab from the URL so deep links and back/forward stay in sync.
  const active = navItems.find((item) => matchPath({ path: item.path, end: true }, pathname));

  return (
    <Tabs
      value={active?.path ?? false}
      aria-label="Main navigation"
      variant="scrollable"
      scrollButtons={false}
      sx={{ minHeight: 0, minWidth: 0, '& .MuiTabs-list': { gap: { xs: 0.5, sm: 1.5 } } }}
    >
      {navItems.map((item) => (
        <Tab
          key={item.path}
          label={item.label}
          value={item.path}
          component={Link}
          to={item.path}
          sx={{
            minWidth: 0,
            px: { xs: 1.25, sm: 1.5 },
            // 44px target; the 31px pill is drawn by ::before so the look stays as designed.
            minHeight: 44,
            position: 'relative',
            isolation: 'isolate',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '6.5px 0',
              zIndex: -1,
              borderRadius: 999,
              transition: 'inherit',
            },
            '&.Mui-selected::before': { backgroundColor: 'primary.light' },
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
            fontWeight: 500,
            transition: (theme) =>
              theme.transitions.create(['background-color', 'color'], {
                duration: theme.transitions.duration.standard,
              }),
            '&:hover': { color: 'text.primary' },
            '&.Mui-selected': { fontWeight: 600, backgroundColor: 'transparent' },
          }}
        />
      ))}
    </Tabs>
  );
}
