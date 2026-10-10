import { describe, expect, it } from 'vitest';
import { buildTheme, type ColorMode } from './theme';

// WCAG 2.x relative luminance / contrast ratio for opaque #rrggbb colours.
const channel = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe.each<ColorMode>(['day', 'night'])('text contrast (%s)', (mode) => {
  const { palette } = buildTheme(mode);
  const { background, text, primary, success, error } = palette;
  // Text on the surfaces where it actually appears in the MVP screens.
  const ink = mode === 'day' ? primary.dark : primary.main;
  const pairs: [string, string, string][] = [
    ['primary text / default', text.primary, background.default],
    ['primary text / paper', text.primary, background.paper],
    ['secondary text / default', text.secondary, background.default],
    ['secondary text / paper', text.secondary, background.paper],
    ['secondary text / panel (ambience strip)', text.secondary, background.panel],
    ['secondary text / primary tint', text.secondary, primary.light],
    ['terracota ink / primary tint', ink, primary.light],
    ['terracota ink / default', ink, background.default],
    ['text on solid terracota', primary.contrastText, primary.main],
    ['icon on solid sage', success.contrastText, success.main],
    ['error text / paper', error.main, background.paper],
  ];

  it.each(pairs)('%s is at least 4.5:1', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
