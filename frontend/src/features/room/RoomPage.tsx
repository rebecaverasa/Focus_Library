import Box from '@mui/material/Box';
import { ViewPlaceholder } from '@/components/ViewPlaceholder';
import { AmbienceStrip } from '@/features/mixer/AmbienceStrip';

export function RoomPage() {
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Upper region: the timer and the list arrive with FL-10 and FL-7. */}
      <Box sx={{ flexGrow: 1 }}>
        <ViewPlaceholder
          kicker="The room"
          title="The chair by the window is waiting."
          note="The timer and the list for the day arrive with FL-10 and FL-7."
        />
      </Box>
      <AmbienceStrip />
    </Box>
  );
}
