import { createTheme, type Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

/**
 * Focus Library MUI theme — the single source of visual truth.
 *
 * Every token mirrors `Documentation/DESIGN.md` (section "Design tokens").
 * Two hand-tuned palettes live in one tree: `buildTheme(mode)` is passed to a
 * single ThemeProvider. MUI's `colorSchemes` is intentionally not used.
 *
 * Rules worth keeping in mind:
 *  - never `#ffffff`: `background.paper` (#fbf6ee on day) is the lightest surface;
 *  - no Roboto, no Material blue;
 *  - every numeral is tabular;
 *  - motion is slow and deliberate (420ms standard), no ripple, no bounce.
 */

export type ColorMode = 'day' | 'night';

declare module '@mui/material/styles' {
  interface TypeBackground {
    /** Ambience strip, avatar fill. */
    panel: string;
  }
  interface Palette {
    /** Slider rails, inner rules. Softer than `divider`. */
    hairline: string;
  }
  interface PaletteOptions {
    hairline?: string;
  }
  interface TypographyVariants {
    timer: CSSProperties;
  }
  interface TypographyVariantsOptions {
    timer?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    timer: true;
  }
}

const HEADING_FONT = "'Quicksand', 'Nunito', system-ui, sans-serif";
const BODY_FONT = "'Nunito', system-ui, sans-serif";

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

const tokens = {
  day: {
    background: { default: '#f4ece0', paper: '#fbf6ee', panel: '#efe5d6' },
    text: { primary: '#3d332b', secondary: '#7f7267' },
    divider: 'rgba(61,51,43,0.14)',
    hairline: 'rgba(61,51,43,0.08)',
    primary: { main: '#c98a63', light: '#f0d9c8', dark: '#8a5334', contrastText: '#fbf6ee' },
    success: { main: '#9fae8c', light: '#e2e8d9', dark: '#5c6a4c', contrastText: '#fbf6ee' },
    secondary: { main: '#b3a4c2', light: '#e5dfec', dark: '#5f5273', contrastText: '#fbf6ee' },
    shadowInk: '61,51,43',
  },
  night: {
    // DESIGN.md only fixes the night terracota tint (#4a3a2e); the sage and lilac
    // tints below are derived the same way (main hue sunk into the night paper).
    // "dark" flips to the light tint so ink-on-tint text stays readable.
    background: { default: '#2b2421', paper: '#352d28', panel: '#241e1b' },
    text: { primary: '#f1e7db', secondary: '#a99a8c' },
    divider: 'rgba(241,231,219,0.16)',
    hairline: 'rgba(241,231,219,0.09)',
    primary: { main: '#e3aa7d', light: '#4a3a2e', dark: '#f0d9c8', contrastText: '#2b2421' },
    success: { main: '#a7b795', light: '#3a3f33', dark: '#e2e8d9', contrastText: '#2b2421' },
    secondary: { main: '#bfb0cd', light: '#3d3644', dark: '#e5dfec', contrastText: '#2b2421' },
    shadowInk: '0,0,0',
  },
} as const;

export function buildTheme(mode: ColorMode): Theme {
  const t = tokens[mode];
  const shadow = (y: number, blur: number, alpha: number) =>
    `0 ${y}px ${blur}px rgba(${t.shadowInk},${mode === 'day' ? alpha : alpha * 2.5})`;
  const shadowSm = shadow(2, 10, 0.06);
  const shadowMd = shadow(4, 18, 0.09);
  const shadowLg = shadow(10, 34, 0.14);

  const focusRing = {
    outline: `2px solid ${t.primary.main}`,
    outlineOffset: 2,
  };

  // MUI expects 25 shadow levels; collapse them onto the three "whispers".
  const shadows = Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return 'none';
    if (i <= 2) return shadowSm;
    if (i <= 8) return shadowMd;
    return shadowLg;
  }) as Theme['shadows'];

  return createTheme({
    palette: {
      mode: mode === 'day' ? 'light' : 'dark',
      background: t.background,
      text: t.text,
      divider: t.divider,
      hairline: t.hairline,
      primary: t.primary,
      secondary: t.secondary,
      success: t.success,
      // Keep MUI's info/warning/error away from Material blue & co.
      info: t.secondary,
      warning: t.primary,
      error: { main: mode === 'day' ? '#b5654a' : '#e29a80' },
      common: { black: '#3d332b', white: '#fbf6ee' },
      action: {
        hover: t.hairline,
        selected: t.primary.light,
        focus: t.hairline,
      },
    },
    shape: { borderRadius: 12 },
    spacing: 8,
    shadows,
    transitions: {
      easing: { easeInOut: EASE, easeOut: EASE, easeIn: EASE, sharp: EASE },
      duration: {
        shortest: 200,
        shorter: 260,
        short: 320,
        standard: 420,
        complex: 520,
        enteringScreen: 420,
        leavingScreen: 360,
      },
    },
    typography: {
      fontFamily: BODY_FONT,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontFamily: HEADING_FONT,
        fontSize: 40,
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: '-0.01em',
      },
      h2: { fontFamily: HEADING_FONT, fontSize: 30, fontWeight: 600, lineHeight: 1.12 },
      h3: { fontFamily: HEADING_FONT, fontSize: 24, fontWeight: 600, lineHeight: 1.2 },
      h4: { fontFamily: HEADING_FONT, fontSize: 19, fontWeight: 600, lineHeight: 1.25 },
      h5: { fontFamily: HEADING_FONT, fontSize: 16, fontWeight: 600, lineHeight: 1.3 },
      h6: {
        fontFamily: HEADING_FONT,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.3,
        textTransform: 'uppercase',
        letterSpacing: '0.10em',
      },
      subtitle1: { fontFamily: HEADING_FONT, fontSize: 15, fontWeight: 600, lineHeight: 1.4 },
      subtitle2: { fontFamily: HEADING_FONT, fontSize: 13, fontWeight: 600, lineHeight: 1.4 },
      body1: { fontSize: 15, fontWeight: 400, lineHeight: 1.7 },
      body2: { fontSize: 13, fontWeight: 400, lineHeight: 1.6 },
      button: { fontFamily: HEADING_FONT, fontSize: 14, fontWeight: 600, textTransform: 'none' },
      caption: { fontSize: 11.5, fontWeight: 400, lineHeight: 1.5 },
      overline: {
        fontFamily: HEADING_FONT,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
      },
      timer: {
        fontFamily: HEADING_FONT,
        fontSize: 56,
        fontWeight: 500,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontVariantNumeric: 'tabular-nums',
            transition: `background-color 420ms ${EASE}, color 420ms ${EASE}`,
          },
          '*:focus-visible': focusRing,
          '*:focus:not(:focus-visible)': { outline: 'none' },
          '::selection': { backgroundColor: t.primary.light, color: t.text.primary },
        },
      },
      MuiTypography: {
        defaultProps: {
          variantMapping: { timer: 'span' },
        },
      },
      MuiButtonBase: {
        // No ripple: feedback is the slow tint + the terracota focus ring.
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: { '&.Mui-focusVisible': focusRing },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 18,
            minHeight: 38,
            transition: `background-color 420ms ${EASE}, border-color 420ms ${EASE}, color 420ms ${EASE}`,
          },
          contained: {
            backgroundColor: t.primary.light,
            color: mode === 'day' ? t.primary.dark : t.primary.main,
            border: `1px solid ${t.primary.main}`,
            '&:hover': { backgroundColor: t.primary.light, borderColor: t.primary.dark },
          },
          outlined: {
            borderColor: t.divider,
            color: t.text.primary,
            '&:hover': { borderColor: t.primary.main, backgroundColor: 'transparent' },
          },
          text: {
            color: mode === 'day' ? t.primary.dark : t.primary.main,
            '&:hover': { backgroundColor: t.hairline },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 11, color: t.primary.main },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontFamily: HEADING_FONT, fontWeight: 600 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          // Night mode would otherwise get MUI's white elevation overlay.
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 16 },
          outlined: { borderColor: t.divider },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderRadius: 16 } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 18, boxShadow: shadowLg } },
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundColor: t.background.paper } },
      },
      MuiPopover: {
        styleOverrides: {
          paper: { borderRadius: 16, border: `1px solid ${t.divider}`, boxShadow: shadowLg },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: t.background.paper,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.divider },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.primary.main },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: t.primary.main,
              borderWidth: 1,
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: { height: 6, color: t.primary.main },
          rail: { backgroundColor: t.hairline, opacity: 1 },
          track: { border: 'none' },
          thumb: {
            width: 13,
            height: 13,
            backgroundColor: t.primary.main,
            border: `2px solid ${t.background.paper}`,
            boxShadow: 'none',
            '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
            '&.Mui-focusVisible': focusRing,
          },
        },
      },
      MuiTabs: {
        styleOverrides: { indicator: { display: 'none' } },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            minHeight: 34,
            fontSize: 13.5,
            color: t.text.secondary,
            '&.Mui-selected': {
              backgroundColor: t.primary.light,
              color: mode === 'day' ? t.primary.dark : t.primary.main,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: t.divider } },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { backgroundColor: t.background.panel, color: t.text.primary },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: t.text.primary,
            color: t.background.paper,
            fontSize: 11.5,
            borderRadius: 8,
          },
        },
      },
    },
  });
}
