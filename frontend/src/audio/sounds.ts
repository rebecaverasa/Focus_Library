import { BookOpen, Clock, CloudRain, Flame, Keyboard, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** The six ambience layers, in the fixed order the mixer shows them. */
export const SOUND_IDS = ['pages', 'rain', 'clock', 'whispers', 'fire', 'keys'] as const;

export type SoundId = (typeof SOUND_IDS)[number];

/** Level per layer, 0–100. */
export type Levels = Record<SoundId, number>;

export interface SoundDef {
  id: SoundId;
  /** Card / sheet title (DESIGN.md "Os seis sons"). */
  label: string;
  /** Subtitle used in the expanded sheet. */
  description: string;
  /** Public URL of the seamless loop (static asset, see public/sounds/). */
  src: string;
  icon: LucideIcon;
}

// BASE_URL keeps the path right if the app is ever served from a sub-path.
const soundSrc = (id: SoundId) => `${import.meta.env.BASE_URL}sounds/${id}.mp3`;

export const SOUNDS: readonly SoundDef[] = [
  {
    id: 'pages',
    label: 'Pages Turning',
    description: 'Paper, slow, irregular',
    src: soundSrc('pages'),
    icon: BookOpen,
  },
  {
    id: 'rain',
    label: 'Rain on the Window',
    description: 'Steady, on old glass',
    src: soundSrc('rain'),
    icon: CloudRain,
  },
  {
    id: 'clock',
    label: 'Wall Clock',
    description: 'Pendulum, one per second',
    src: soundSrc('clock'),
    icon: Clock,
  },
  {
    id: 'whispers',
    label: 'Distant Whispers',
    description: 'Two rooms away',
    src: soundSrc('whispers'),
    icon: MessageCircle,
  },
  {
    id: 'fire',
    label: 'Crackling Fireplace',
    description: 'Embers and the odd pop',
    src: soundSrc('fire'),
    icon: Flame,
  },
  {
    id: 'keys',
    label: 'Laptop Keyboard',
    description: 'Soft, unhurried typing',
    src: soundSrc('keys'),
    icon: Keyboard,
  },
];

export const SOUNDS_BY_ID = Object.fromEntries(SOUNDS.map((s) => [s.id, s])) as Record<
  SoundId,
  SoundDef
>;

/** All six layers at the same level (handy for "everything off"). */
export const uniformLevels = (level: number): Levels =>
  Object.fromEntries(SOUND_IDS.map((id) => [id, level])) as Levels;

/** Opening mix, taken from the prototype (the "Rainy Reading Room" seed scene). */
export const DEFAULT_LEVELS: Levels = {
  pages: 34,
  rain: 66,
  clock: 24,
  whispers: 0,
  fire: 0,
  keys: 0,
};

/** Opening master level, from the prototype. */
export const DEFAULT_MASTER = 72;
