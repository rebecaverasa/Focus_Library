import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ViewPlaceholderProps {
  kicker: string;
  title: string;
  note: string;
}

/** Quiet stand-in for a view whose content lands in a later ticket. */
export function ViewPlaceholder({ kicker, title, note }: ViewPlaceholderProps) {
  return (
    <Stack spacing={1.5} sx={{ px: { xs: 2, sm: 6 }, py: { xs: 4, sm: 5.5 }, maxWidth: 720 }}>
      <Typography variant="h6" sx={{ color: 'primary.main' }}>
        {kicker}
      </Typography>
      <Typography variant="h2" component="h1">
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {note}
      </Typography>
    </Stack>
  );
}
