import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCurrentUser } from '@/features/auth/useCurrentUser';

/** Initials avatar on the panel fill + first name. */
export function UserBadge() {
  const user = useCurrentUser();

  return (
    <Stack direction="row" spacing="9px" sx={{ alignItems: 'center' }}>
      <Avatar
        sx={{
          width: 29,
          height: 29,
          bgcolor: 'background.panel',
          color: 'text.secondary',
          fontFamily: (theme) => theme.typography.h5.fontFamily,
          fontWeight: 600,
          fontSize: 11.5,
        }}
      >
        {user.initials}
      </Avatar>
      <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{user.name}</Typography>
    </Stack>
  );
}
