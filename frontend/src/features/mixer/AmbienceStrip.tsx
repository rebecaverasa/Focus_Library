import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { SOUNDS, useAmbience } from '@/audio';
import { SoundCard } from './SoundCard';
import type { LastLevels } from './mixerState';
import { arrowKeyHandler, rememberLevels, sceneCaption, toggleMute } from './mixerState';

const breathe = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.95; }
`;

/** Bottom band of the room: six sound cards plus master volume and play/pause. */
export function AmbienceStrip() {
  const { levels, master, playing, setLevel, setMaster, toggle } = useAmbience();

  // Last non-zero level per layer, for the card click. Kept here (not in the engine) because
  // only the UI needs it; FL-6 can lift it into a shared hook when the sheet lands.
  const [last, setLast] = useState<LastLevels>({});
  const remembered = rememberLevels(last, levels);
  if (remembered !== last) setLast(remembered);

  return (
    <Paper
      component="section"
      aria-label="Ambience"
      square
      elevation={0}
      sx={{
        bgcolor: 'background.panel',
        borderTop: 1,
        borderColor: 'divider',
        p: '22px 26px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box
          aria-hidden
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: `${breathe} 4s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.8 },
          }}
        />
        <Typography
          component="h2"
          sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 600, fontSize: 14 }}
        >
          Ambience
        </Typography>
        <Typography
          variant="caption"
          aria-live="polite"
          sx={{ color: 'text.secondary', fontSize: 11.5 }}
        >
          {sceneCaption(levels, playing)}
        </Typography>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Box sx={{ width: 132 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                Master
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
              >
                {master}%
              </Typography>
            </Box>
            <Slider
              size="small"
              min={0}
              max={100}
              step={1}
              value={master}
              onChange={(_, value) => setMaster(value)}
              onKeyDownCapture={arrowKeyHandler(master, setMaster)}
              aria-label="Master volume"
              aria-valuetext={`${master}%`}
              sx={{
                py: '8px',
                '& .MuiSlider-rail, & .MuiSlider-track': { height: 5, borderRadius: '3px' },
                '& .MuiSlider-thumb': { borderColor: 'background.panel' },
              }}
            />
          </Box>
          <ButtonBase
            onClick={toggle}
            aria-label={playing ? 'Pause ambience' : 'Play ambience'}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 1,
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            {playing ? (
              <Pause size={18} strokeWidth={1.6} aria-hidden />
            ) : (
              <Play size={18} strokeWidth={1.6} aria-hidden />
            )}
          </ButtonBase>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        {SOUNDS.map((sound) => (
          <SoundCard
            key={sound.id}
            sound={sound}
            level={levels[sound.id]}
            playing={playing}
            onChange={(level) => setLevel(sound.id, level)}
            onToggle={() => {
              const result = toggleMute(sound.id, levels[sound.id], last);
              setLast(result.last);
              setLevel(sound.id, result.level);
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}
