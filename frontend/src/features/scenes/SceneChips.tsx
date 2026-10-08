import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { SOUND_IDS } from '@/audio';
import type { Preset } from '@/api/presets';
import { SceneNameDialog } from './SceneNameDialog';
import { barHeight, presetLevels } from './sceneState';

const FADE = '420ms cubic-bezier(0.4, 0, 0.2, 1)';
const CHIP_HEIGHT = { xs: 44, sm: 36 };
// Chip is 36px from sm up; this grows the clickable box to 44px without changing the look.
const CHIP_HIT = {
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: { xs: -2, sm: -5 },
    bottom: { xs: -2, sm: -5 },
    left: 0,
    right: 0,
  },
} as const;

/** Six 3px bars from the saved levels (not the live ones); terracotta when the layer is open. */
function Sparkline({ preset }: { preset: Preset }) {
  const levels = presetLevels(preset);
  return (
    <Box
      aria-hidden
      sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 14, flexShrink: 0 }}
    >
      {SOUND_IDS.map((id) => (
        <Box
          key={id}
          sx={{
            width: 3,
            height: barHeight(levels[id]),
            borderRadius: '1px',
            bgcolor: levels[id] > 0 ? 'primary.main' : 'divider',
          }}
        />
      ))}
    </Box>
  );
}

interface SceneChipsProps {
  presets: readonly Preset[];
  /** Scene the live mix currently matches; its chip is tinted. */
  current: Preset | null;
  onLoad: (preset: Preset) => void;
  onSave: () => void;
  onRename: (preset: Preset, name: string) => void;
  onDelete: (preset: Preset) => void;
}

/** SCENES row: one chip per saved scene (with a context menu) plus the dashed save chip. */
export function SceneChips({
  presets,
  current,
  onLoad,
  onSave,
  onRename,
  onDelete,
}: SceneChipsProps) {
  const [menu, setMenu] = useState<{ preset: Preset; anchor: HTMLElement } | null>(null);
  const [renaming, setRenaming] = useState<Preset | null>(null);

  const openMenu = (preset: Preset, anchor: HTMLElement) => setMenu({ preset, anchor });
  const closeMenu = () => setMenu(null);

  return (
    <Box
      component="ul"
      aria-label="Scenes"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        // 10px between wrapped rows so the 44px hit areas of neighbours do not overlap.
        gap: '10px 8px',
        m: 0,
        p: 0,
        listStyle: 'none',
        minWidth: 0,
      }}
    >
      {presets.map((preset) => {
        const loaded = preset.id === current?.id;
        return (
          <Box
            component="li"
            key={preset.id}
            // Right-click / the keyboard context-menu key open the same menu as the "..." button.
            onContextMenu={(e: MouseEvent<HTMLElement>) => {
              e.preventDefault();
              openMenu(preset, e.currentTarget);
            }}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              maxWidth: '100%',
              height: CHIP_HEIGHT,
              borderRadius: 999,
              border: 1,
              borderColor: loaded ? 'primary.main' : 'divider',
              bgcolor: loaded ? alpha(theme.palette.primary.main, 0.16) : 'background.paper',
              transition: `background-color ${FADE}, border-color ${FADE}`,
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            })}
          >
            <ButtonBase
              onClick={() => onLoad(preset)}
              aria-pressed={loaded}
              sx={{
                ...CHIP_HIT,
                alignSelf: 'stretch',
                minWidth: 0,
                gap: '9px',
                pl: '14px',
                pr: '4px',
                borderRadius: '999px 0 0 999px',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600,
                fontSize: 12.5,
                color: loaded ? 'primary.dark' : 'text.primary',
              }}
            >
              <Sparkline preset={preset} />
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {preset.name}
              </Box>
            </ButtonBase>
            <ButtonBase
              onClick={(e) => openMenu(preset, e.currentTarget)}
              aria-label={`Options for ${preset.name}`}
              aria-haspopup="menu"
              sx={{
                ...CHIP_HIT,
                alignSelf: 'stretch',
                width: 44,
                flexShrink: 0,
                borderRadius: '0 999px 999px 0',
                color: 'text.secondary',
              }}
            >
              <MoreHorizontal size={16} strokeWidth={1.6} aria-hidden />
            </ButtonBase>
          </Box>
        );
      })}
      <li>
        <ButtonBase
          onClick={onSave}
          sx={{
            ...CHIP_HIT,
            height: CHIP_HEIGHT,
            px: '14px',
            borderRadius: 999,
            border: '1px dashed',
            borderColor: 'primary.main',
            color: 'primary.dark',
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 600,
            fontSize: 12.5,
          }}
        >
          + Save this mix
        </ButtonBase>
      </li>

      <Menu open={menu !== null} anchorEl={menu?.anchor} onClose={closeMenu}>
        <MenuItem
          sx={{ minHeight: 44 }}
          onClick={() => {
            setRenaming(menu?.preset ?? null);
            closeMenu();
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          sx={{ minHeight: 44, color: 'error.main' }}
          onClick={() => {
            if (menu) onDelete(menu.preset);
            closeMenu();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <SceneNameDialog
        open={renaming !== null}
        title="Rename scene"
        confirmLabel="Rename"
        initialName={renaming?.name ?? ''}
        onClose={() => setRenaming(null)}
        onSubmit={(name) => {
          if (renaming) onRename(renaming, name);
          setRenaming(null);
        }}
      />
    </Box>
  );
}
