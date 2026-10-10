import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

/** "FL" mark + wordmark; links home. */
export function BrandMark() {
  return (
    <Stack
      direction="row"
      spacing="10px"
      component={Link}
      to="/"
      aria-label="Focus Library, go to The room"
      sx={{
        alignItems: 'center',
        color: 'text.primary',
        textDecoration: 'none',
        borderRadius: 1,
        minHeight: 44,
        // Mark alone is 28px wide on phones; pad the link to a 44px target.
        px: { xs: '8px', sm: 0 },
      }}
    >
      <Box
        aria-hidden
        // Drawn by CSS so the link's visible text is just the wordmark (label-in-name).
        sx={{
          '&::before': { content: '"FL"' },
          width: 28,
          height: 28,
          borderRadius: '10px',
          bgcolor: 'primary.light',
          color: (t) =>
            t.palette.mode === 'light' ? t.palette.primary.dark : t.palette.primary.main,
          display: 'grid',
          placeItems: 'center',
          fontFamily: (theme) => theme.typography.h5.fontFamily,
          fontWeight: 700,
          fontSize: 12.5,
        }}
      />
      <Typography
        component="span"
        sx={{
          fontFamily: (theme) => theme.typography.h5.fontFamily,
          fontSize: 17,
          display: { xs: 'none', sm: 'inline' },
          fontWeight: 600,
        }}
      >
        Focus Library
      </Typography>
    </Stack>
  );
}
