import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useColorMode } from './theme';

// Temporary theme preview — replaced by the real app shell in FL-2.
function App() {
  const { mode, toggleMode } = useColorMode();

  return (
    <Box component="main" sx={{ minHeight: '100vh', px: { xs: 2, sm: 6 }, py: 6 }}>
      <Stack spacing={4} sx={{ maxWidth: 720, mx: 'auto' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="overline" color="primary">
            Foundations · {mode}
          </Typography>
          <Button variant="outlined" onClick={toggleMode}>
            {mode === 'day' ? 'Switch to night' : 'Switch to day'}
          </Button>
        </Stack>

        <Box>
          <Typography variant="h1">Take the chair by the window.</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '44ch' }}>
            The rain is already on. Sign in and the room remembers your timer, your list, and the
            scenes you keep coming back to.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Typography variant="h6" color="text.secondary">
              Session three · focusing on
            </Typography>
            <Typography variant="timer">24:59</Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="contained">Start focus</Button>
              <Button variant="outlined">Reset</Button>
              <Button variant="text">Skip to break</Button>
            </Stack>
            <Slider defaultValue={66} aria-label="Rain on the Window" />
            <TextField placeholder="Add a task…" size="small" />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default App;
