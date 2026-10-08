import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Maximize2, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { SOUNDS } from '@/audio';
import { SceneChips } from '@/features/scenes/SceneChips';
import { SceneNameDialog } from '@/features/scenes/SceneNameDialog';
import { useSceneControl } from '@/features/scenes/useSceneControl';
import { MixerSheet } from './MixerSheet';
import { SoundCard } from './SoundCard';
import { arrowKeyHandler, sceneCaption } from './mixerState';
import { useMixer } from './useMixer';

// Below this width the six cards collapse into a single bar that opens the sheet (DESIGN.md).
const WIDE = '@media (min-width:1100px)';

const breathe = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.95; }
`;

/** Bottom band of the room: six sound cards plus master volume and play/pause. */
export function AmbienceStrip() {
  // The strip owns the mixer (levels + mute memory) and hands it to the sheet.
  const mixer = useMixer();
  const { levels, master, playing, setLevel, setMaster, toggle, toggleSound } = mixer;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const scenes = useSceneControl(mixer);

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
        p: {
          xs: '14px 16px calc(14px + env(safe-area-inset-bottom))',
          sm: '18px 26px 20px',
          [WIDE]: '22px 26px 24px',
        },
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
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            columnGap: '10px',
            minWidth: 0,
            flex: '1 1 0',
            [WIDE]: { flex: '0 1 auto' },
          }}
        >
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
            {sceneCaption(scenes.label, levels, playing)}
          </Typography>
        </Box>

        <ButtonBase
          onClick={() => setSheetOpen(true)}
          aria-label="Expand mixer"
          aria-haspopup="dialog"
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            color: 'text.secondary',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Maximize2 size={16} strokeWidth={1.6} aria-hidden />
        </ButtonBase>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', [WIDE]: { ml: 'auto' } }}>
          <Box sx={{ width: 132, display: 'none', [WIDE]: { display: 'block' } }}>
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
                // Rail + thumb are ~22px tall; grow the pointer target to 44px.
                '&::after': { content: '""', position: 'absolute', inset: '-11px 0' },
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
              flexShrink: 0,
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

      <Box
        sx={{
          display: 'none',
          [WIDE]: { display: 'grid' },
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px',
        }}
      >
        {SOUNDS.map((sound) => (
          <SoundCard
            key={sound.id}
            sound={sound}
            level={levels[sound.id]}
            playing={playing}
            onChange={(level) => setLevel(sound.id, level)}
            onToggle={() => toggleSound(sound.id)}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: '8px', sm: '14px' },
        }}
      >
        <Typography
          component="h3"
          sx={{
            color: 'text.secondary',
            fontFamily: 'Quicksand, sans-serif',
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Scenes
        </Typography>
        <SceneChips
          presets={scenes.presets}
          current={scenes.current}
          onLoad={scenes.load}
          onSave={() => setSaving(true)}
          onRename={scenes.rename}
          onDelete={scenes.remove}
        />
      </Box>
      <SceneNameDialog
        open={saving}
        title="Save this mix"
        confirmLabel="Save"
        initialName=""
        onClose={() => setSaving(false)}
        onSubmit={(name) => {
          scenes.saveCurrent(name);
          setSaving(false);
        }}
      />
      <MixerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        mixer={mixer}
        scene={scenes.label}
      />
    </Paper>
  );
}
