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
      sx={{ alignItems: 'center', color: 'text.primary', textDecoration: 'none', borderRadius: 1 }}
    >
      <Box
        aria-hidden
        sx={{
          width: 28,
          height: 28,
          borderRadius: '10px',
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          fontFamily: (theme) => theme.typography.h5.fontFamily,
          fontWeight: 700,
          fontSize: 12.5,
        }}
      >
        FL
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: (theme) => theme.typography.h5.fontFamily,
          fontSize: 17,
          fontWeight: 600,
        }}
      >
        Focus Library
      </Typography>
    </Stack>
  );
}
