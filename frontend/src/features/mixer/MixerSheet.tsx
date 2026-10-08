import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { SOUNDS } from '@/audio';
import type { SoundDef } from '@/audio';
import { arrowKeyHandler, formatLevel, isCardActive } from './mixerState';
import type { Mixer } from './useMixer';

const FADE = '420ms cubic-bezier(0.4, 0, 0.2, 1)';
const TITLE_ID = 'mixer-sheet-title';

interface MixerSheetProps {
  open: boolean;
  onClose: () => void;
  mixer: Mixer;
  /** Name of the scene the live mix matches ('Custom mix' otherwise). */
  scene: string;
}

/** Full mixer: six rows sharing the strip's state, opened from the strip. */
export function MixerSheet({ open, onClose, mixer, scene }: MixerSheetProps) {
  const { playing, setLevel, toggleSound, levels } = mixer;
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      aria-labelledby={TITLE_ID}
      transitionDuration={{ enter: 420, exit: 300 }}
      slotProps={{
        paper: {
          sx: {
            // Fixed + left/right 0 + auto margins centres the 760px sheet.
            width: 760,
            maxWidth: { xs: '100%', sm: 'calc(100% - 32px)' },
            mx: 'auto',
            maxHeight: 'calc(100dvh - 24px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            borderRadius: '18px 18px 0 0',
            border: 1,
            borderBottom: 0,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: '0 10px 34px rgba(61,51,43,0.14)',
            p: {
              xs: '20px 16px calc(24px + env(safe-area-inset-bottom))',
              sm: '28px 34px calc(34px + env(safe-area-inset-bottom))',
            },
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          columnGap: '12px',
          rowGap: '4px',
          mb: '20px',
        }}
      >
        <Typography id={TITLE_ID} component="h2" variant="h4" sx={{ fontSize: 22 }}>
          Ambience
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12.5 }}>
          {playing ? scene : 'Paused'}
        </Typography>
        <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
          Arrow keys nudge by 4
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {SOUNDS.map((sound) => (
          <SoundRow
            key={sound.id}
            sound={sound}
            level={levels[sound.id]}
            playing={playing}
            onChange={(level) => setLevel(sound.id, level)}
            onToggle={() => toggleSound(sound.id)}
          />
        ))}
      </Box>
    </Drawer>
  );
}

interface SoundRowProps {
  sound: SoundDef;
  level: number;
  playing: boolean;
  onChange: (level: number) => void;
  onToggle: () => void;
}

function SoundRow({ sound, level, playing, onChange, onToggle }: SoundRowProps) {
  const active = isCardActive(level, playing);
  const Icon = sound.icon;

  return (
    <Box
      data-active={active}
      sx={(theme) => {
        const { palette } = theme;
        const rowColor = active ? palette.primary.light : palette.background.paper;
        const idle = alpha(palette.text.secondary, 0.5);
        return {
          display: 'grid',
          // plate 36 / text 180 / slider / value 52, gap 18
          // Phones: [plate+text | value] over a full-width slider; sm+: one line.
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr) 44px',
            sm: '36px 180px minmax(0, 1fr) 52px',
          },
          alignItems: 'center',
          columnGap: '18px',
          rowGap: '2px',
          p: '12px',
          borderRadius: '13px',
          border: 1,
          borderColor: active ? 'primary.main' : 'divider',
          bgcolor: rowColor,
          color: active ? 'primary.main' : 'text.secondary',
          transition: `background-color ${FADE}, border-color ${FADE}, color ${FADE}`,
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          '& .MuiSlider-root': {
            color: active ? palette.primary.main : idle,
            transition: `color ${FADE}`,
            // 44px touch target on phones (6px rail + padding), 32px from sm up.
            py: { xs: '19px', sm: '13px' },
            gridColumn: { xs: '1 / 3', sm: 'auto' },
            gridRow: { xs: 2, sm: 'auto' },
            '@media (pointer: coarse)': { '& .MuiSlider-thumb': { width: 20, height: 20 } },
          },
          '& .MuiSlider-rail, & .MuiSlider-track': { height: 6, borderRadius: '3px' },
          '& .MuiSlider-track': { transition: 'none' },
          '& .MuiSlider-thumb': {
            backgroundColor: active ? palette.primary.main : idle,
            borderColor: rowColor,
            transition: `background-color ${FADE}, border-color ${FADE}`,
          },
        };
      }}
    >
      {/* Sibling of the slider, so dragging the rail never toggles the row. */}
      <ButtonBase
        onClick={onToggle}
        aria-label={`${level > 0 ? 'Mute' : 'Unmute'} ${sound.label}`}
        sx={{
          gridColumn: { xs: '1', sm: '1 / 3' },
          display: 'grid',
          gridTemplateColumns: { xs: '36px minmax(0, 1fr)', sm: 'subgrid' },
          columnGap: '18px',
          minHeight: 44,
          alignItems: 'center',
          textAlign: 'left',
          borderRadius: '8px',
          color: 'inherit',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '11px',
            bgcolor: 'background.panel',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon size={18} strokeWidth={1.6} aria-hidden />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 600,
              fontSize: 14.5,
              lineHeight: 1.3,
              color: active ? 'text.primary' : 'text.secondary',
              transition: `color ${FADE}`,
            }}
          >
            {sound.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {sound.description}
          </Typography>
        </Box>
      </ButtonBase>
      <Slider
        size="small"
        min={0}
        max={100}
        step={1}
        value={level}
        onChange={(_, value) => onChange(value)}
        onKeyDownCapture={arrowKeyHandler(level, onChange)}
        aria-label={`${sound.label} volume`}
        aria-valuetext={`${level}%`}
      />
      <Typography
        sx={{
          gridColumn: { xs: 2, sm: 'auto' },
          gridRow: { xs: 1, sm: 'auto' },
          textAlign: 'right',
          fontFamily: 'Quicksand, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          fontVariantNumeric: 'tabular-nums',
          color: active ? 'text.primary' : 'text.secondary',
        }}
      >
        {formatLevel(level, playing)}
      </Typography>
    </Box>
  );
}
