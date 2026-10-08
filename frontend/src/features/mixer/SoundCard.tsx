import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Slider from '@mui/material/Slider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { SoundDef } from '@/audio';
import { arrowKeyHandler, formatLevel, isCardActive } from './mixerState';

interface SoundCardProps {
  sound: SoundDef;
  level: number;
  playing: boolean;
  onChange: (level: number) => void;
  /** Click on the icon/name area: mute, or restore the last level. */
  onToggle: () => void;
}

const FADE = '420ms cubic-bezier(0.4, 0, 0.2, 1)';

/** One layer of the mixer: lights up (420ms) once it is above zero and the room is playing. */
export function SoundCard({ sound, level, playing, onChange, onToggle }: SoundCardProps) {
  const active = isCardActive(level, playing);
  const Icon = sound.icon;

  return (
    <Box
      data-active={active}
      sx={(theme) => {
        const { palette } = theme;
        const cardColor = active ? palette.primary.light : palette.background.paper;
        const idle = alpha(palette.text.secondary, 0.5);
        return {
          minWidth: 0,
          p: '13px 14px',
          borderRadius: '14px',
          border: 1,
          borderColor: active ? 'primary.main' : 'divider',
          bgcolor: cardColor,
          color: active ? 'primary.main' : 'text.secondary',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          transition: `background-color ${FADE}, border-color ${FADE}, color ${FADE}`,
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          '& .MuiSlider-root': {
            color: active ? palette.primary.main : idle,
            transition: `color ${FADE}`,
            // Taller hit area than the 5px rail so the pointer has room.
            py: '8px',
            // Rail + thumb are ~22px tall; grow the pointer target to 44px.
            '&::after': { content: '""', position: 'absolute', inset: '-11px 0' },
          },
          '& .MuiSlider-rail, & .MuiSlider-track': { height: 5, borderRadius: '3px' },
          '& .MuiSlider-track': { transition: 'none' },
          '& .MuiSlider-thumb': {
            backgroundColor: active ? palette.primary.main : idle,
            borderColor: cardColor,
            transition: `background-color ${FADE}, border-color ${FADE}`,
          },
        };
      }}
    >
      {/* Sibling of the slider, so dragging or clicking the rail never toggles the card. */}
      <ButtonBase
        onClick={onToggle}
        aria-label={`${level > 0 ? 'Mute' : 'Unmute'} ${sound.label}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '10px',
          textAlign: 'left',
          borderRadius: '8px',
          color: 'inherit',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Icon size={18} strokeWidth={1.6} aria-hidden />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
          >
            {formatLevel(level, playing)}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 600,
            fontSize: 12.5,
            lineHeight: 1.3,
            color: active ? 'text.primary' : 'text.secondary',
            transition: `color ${FADE}`,
          }}
        >
          {sound.label}
        </Typography>
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
    </Box>
  );
}
