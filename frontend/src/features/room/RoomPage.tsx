import { useState } from 'react';
import Box from '@mui/material/Box';
import { ViewPlaceholder } from '@/components/ViewPlaceholder';
import { AmbienceStrip } from '@/features/mixer/AmbienceStrip';
import { TaskList } from '@/features/notes/TaskList';
import { todayISO } from '@/features/notes/taskState';

export function RoomPage() {
  // Selected day; FL-8's picker will own the setter.
  const [date] = useState(todayISO);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Below 1100px the list stacks under the timer (DESIGN.md); above it is 1fr / 1.42fr. */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1fr) minmax(0,1.42fr)' },
        }}
      >
        <Box
          sx={{
            borderStyle: 'solid',
            borderColor: 'divider',
            borderWidth: { xs: '0 0 1px', lg: '0 1px 0 0' },
          }}
        >
          {/* The timer arrives with FL-10. */}
          <ViewPlaceholder
            kicker="The room"
            title="The chair by the window is waiting."
            note="The timer arrives with FL-10."
          />
        </Box>
        <Box sx={{ p: { xs: '24px 16px', sm: '32px 28px', lg: '44px 42px' } }}>
          <TaskList date={date} />
        </Box>
      </Box>
      <AmbienceStrip />
    </Box>
  );
}
