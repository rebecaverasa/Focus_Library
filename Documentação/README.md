# Handoff: Focus Library

A virtual library / study room for focus and productivity. Ambient sound mixer, per-day
task notes, Pomodoro timer, focus history and (later) shared rooms.

## About the design files

Everything in this bundle is a **design reference authored in HTML** — a prototype that
shows intended look and behavior. It is not production code to copy. The task is to
recreate these screens in the target codebase: **React + TypeScript + Material UI (MUI v6)**,
using `theme.ts` in this folder as the single source of visual truth.

`reference/Focus Library.dc.html` is the interactive prototype (open it in a browser —
sliders, tasks, day picker, timer and the day/night toggle all work). `screens/` holds a
PNG of every screen. `TICKETS.md` is the Jira-ready breakdown.

## Fidelity

**High fidelity.** Colors, type, spacing, radii and copy are final. Recreate pixel-close
using MUI components with the custom theme applied — do not restyle from scratch and do not
ship MUI defaults (Roboto / Material blue).

Two things are intentionally unfinished:
- **Photography** is placeholder (login plate, shared-room card washes). Real images pending.
- **Sound files** are not included. Six loops are required (see Ticket FL-4).

---

## Design tokens

All values live in `theme.ts`. Reproduced here for reference.

### Color — Day (default)

| Role | Hex | Use |
|---|---|---|
| `background.default` | `#f4ece0` | app ground (warm oat) |
| `background.paper` | `#fbf6ee` | cards, inputs, popovers — **the lightest surface in the product** |
| panel | `#efe5d6` | ambience strip, avatar fills |
| `text.primary` | `#3d332b` | body |
| `text.secondary` | `#7f7267` | meta, captions |
| divider | `rgba(61,51,43,0.14)` | 1px borders |
| hairline | `rgba(61,51,43,0.08)` | slider rails, inner rules |
| `primary.main` (terracotta) | `#c98a63` | active state, ring, sliders |
| `primary.light` | `#f0d9c8` | tint fills: buttons, active task, active sound card |
| `primary.dark` (ink) | `#8a5334` | text on terracotta tint |
| `success.main` (sage) | `#9fae8c` | completed tasks, break phase |
| `success.light` | `#e2e8d9` | sage tint |
| `success.dark` | `#5c6a4c` | text on sage tint |
| `secondary.main` (lilac) | `#b3a4c2` | third data series |
| `secondary.light` | `#e5dfec` | lilac tint |
| `secondary.dark` | `#5f5273` | text on lilac tint |

**Never use `#ffffff`.** Pure white was rejected as uncomfortable; `#fbf6ee` is the ceiling.

### Color — Night

| Role | Hex |
|---|---|
| `background.default` | `#2b2421` |
| `background.paper` | `#352d28` |
| panel | `#241e1b` |
| `text.primary` | `#f1e7db` |
| `text.secondary` | `#a99a8c` |
| divider | `rgba(241,231,219,0.16)` |
| hairline | `rgba(241,231,219,0.09)` |
| primary (terracotta) | `#e3aa7d`, tint `#4a3a2e` |
| success (sage) | `#a7b795` |
| secondary (lilac) | `#bfb0cd` |

### Typography

Quicksand (headings, UI labels, numerals) over Nunito (body). Load via
`@fontsource/quicksand` (400/500/600/700) and `@fontsource/nunito` (300/400/500/600 + italic).
Quicksand has no italic — emphasis uses weight only.

| Token | Family | Size | Weight | Line-height | Notes |
|---|---|---|---|---|---|
| h1 | Quicksand | 40 | 600 | 1.10 | letter-spacing −0.01em |
| h2 | Quicksand | 30 | 600 | 1.12 | login headline runs 48/600 |
| h3 | Quicksand | 24 | 600 | 1.20 | screen titles (History, Rooms) run 30 |
| h4 | Quicksand | 19 | 600 | 1.25 | list header runs 26 |
| h5 | Quicksand | 16 | 600 | 1.30 | |
| h6 | Quicksand | 12 | 700 | 1.30 | uppercase, tracking 0.10em |
| body1 | Nunito | 15 | 400 | 1.70 | |
| body2 | Nunito | 13 | 400 | 1.60 | |
| button | Quicksand | 14 | 600 | — | no uppercase |
| caption | Nunito | 11.5 | 400 | 1.50 | |
| timer numerals | Quicksand | 56 | 500 | 1.0 | `font-variant-numeric: tabular-nums` |

All figures (timer, percentages, counters, chart labels) are tabular.

### Spacing, radius, shadow, motion

- Spacing base `8`. Screen padding 36–48px, card padding 16–18px, list gap 9px.
- Radius: `12` default · `999` buttons & chips · `14` task rows / sound cards ·
  `16` cards & Paper · `18` sheets, dialogs, screen shells · `50%` avatars, checkboxes.
- Shadows are whispers: `0 2px 10px rgba(61,51,43,.06)` → `0 4px 18px rgba(61,51,43,.09)` →
  `0 10px 34px rgba(61,51,43,.14)` (popover / sheet).
- Motion is slow and deliberate. `standard: 420ms`, ease `cubic-bezier(0.4,0,0.2,1)`.
  Nothing snaps, nothing bounces, no gamified feedback.
- Focus ring: `2px solid primary.main`, offset 2. Never the browser default.

### Icons

Lucide, 1.6 stroke width, round caps and joins. 18px inline, 16px in buttons, 30px on
shared-room card washes.

---

## Screens

### 1 — Foundations (`screens/01-foundations.png`)
Not a product screen. The palette and type reference for the team.

### 2 — Login (`screens/02-login.png`)

**Purpose:** sign in with Google, or look around as a guest.

**Layout:** 1360×800 shell, radius 18. Two columns `1.05fr / 1fr`. Left column padding 64,
`space-between` (brand mark top / copy block middle / fine print bottom). Right column is
`background.paper` with 32px padding holding an image plate at radius 14 inside an 8px mat
of the surface color plus a 1px divider outline.

**Components**
- Brand mark: 32×32, radius 10, `primary.light` fill, "FL" in Quicksand 700/14 terracotta;
  wordmark Quicksand 600/18.
- Kicker: 11.5px, 700, uppercase, tracking 0.14em, terracotta.
- Headline: Quicksand 600/48, line-height 1.08 — "Take the chair by the window."
- Body: Nunito 16/1.7, `text.secondary`, max 44ch —
  "The rain is already on. Sign in and the room remembers your timer, your list, and the scenes you keep coming back to."
- Primary button: pill, `primary.light` fill, 1px terracotta border, `#8a5334` text,
  14.5px, min-height 44, Google glyph 17px — "Continue with Google".
- Secondary button: pill, transparent, 1px divider — "Look around as a guest".
- Fine print, 11.5px `text.secondary`: "No ads. No streaks." · "Sound plays only when you ask."

**MUI base:** `Stack`, `Button`, `Typography`, `Box`.

### 3 — The room (`screens/03-main-room-day.png`, night: `screens/05-main-room-night.png`)

The main screen. Three regions: header, two-column body, ambience strip.

**Header** — 16/26 padding, 1px bottom divider.
Brand mark 28px · nav (`Tabs`): active tab is a pill with `primary.light` fill and terracotta
text, inactive is `text.secondary` 13.5px · day/night `IconButton` 34×34, radius 11, 1px
divider, terracotta sun/moon · avatar 29px circle on panel fill + name 12.5px.

**Body** — `Grid` `1fr / 1.42fr`. The task list is deliberately the larger column; the timer
is the smaller one. A 1px divider separates them.

**Left — Pomodoro** (padding 36/32/40, centered, gap 22)
- Kicker 11px 700 uppercase terracotta: "Session three · focusing on" (break: "Break · next up").
- Active task name, Quicksand 600/17.
- Ring: 236×236. Track 11px `rgba(...,0.08)`; progress 11px terracotta (sage on break),
  round cap, `r=106`, circumference **666** — dasharray and offset must both use 666.
  Inner disc `background.paper` inset 16px.
- Clock: Quicksand 500/56, tabular. Phase label 12px 600 uppercase `text.secondary`.
- Buttons: "Start focus / Pause / Resume" (pill, tinted, min-width 118), "Reset" (pill,
  outlined), "Skip to break / Back to focus" (text button, terracotta).
- Session dots: six 11px circles, 1px terracotta border, filled when complete;
  "3 of 6 sessions · 1h 15m", above a hairline top rule.

**Right — Notes list, per day** (padding 36/40/40, gap 18)
- **Header is the date control.** The day label (Quicksand 600/26 — "Today", otherwise
  "August 16, 2026") plus a pill holding a calendar icon and a chevron; the whole thing is
  one button that opens the day picker. Right side: "{n} left", 11.5px tabular.
- Day picker popover (`screens/04-day-picker.png`): 286px, radius 16, `background.paper`,
  1px divider, shadow `0 10px 34px rgba(61,51,43,.14)`, offset 52px below the header,
  z-index 20. Month title Quicksand 600/14 between two 28px arrow buttons (radius 9).
  Weekday row 10px 700 `text.secondary`. Day cells 34px tall, radius 10: selected =
  terracotta fill with `#fbf6ee` text, today = `primary.light` fill, days holding notes show
  a 4px terracotta dot under the numeral. Footer: "A dot marks a day with notes" +
  a "Today" reset pill.
- Add field: `TextField` on `background.paper`, radius 12, placeholder "Add a task…",
  Enter submits; 44px square tinted add button with a plus icon.
- Task row: radius 14, 16px padding, gap 13. Background — active task `primary.light` with
  terracotta border, pending `background.paper` with divider border, done transparent.
  Left: 22px round checkbox, 1.5px border, fills sage with a `#fbf6ee` check when done.
  Middle: task text 15.5px (strikethrough + `text.secondary` when done) over meta 11px
  ("25m estimate" / "50m logged"). Right: a "Focus" pill — terracotta fill with `#fbf6ee`
  text when it is the active task ("In focus"), outlined otherwise, "Done" when complete —
  then a 24px remove button.
- Empty state: "No notes for {Past day / Upcoming}. Add the first one above." on a
  `background.paper` card, radius 13, centered.
- Footer hairline: sage dot + "Completing a task ends its session and logs the minutes".

**Ambience strip** — full width, panel background, 1px top divider, padding 22/26/24.
- Row 1: pulsing terracotta dot (4s ease-in-out opacity 0.5→0.95), "Ambience" Quicksand
  600/14, then "{scene} · {n} of six open" 11.5px; right side master slider (132px wide,
  labelled "Master" + tabular %) and a 44px round play/pause button, tinted.
- Row 2: six sound cards in a `repeat(6,1fr)` grid, gap 12. Card radius 14, padding 13/14.
  Inactive: `background.paper` + divider border, icon and name `text.secondary`.
  Active (level > 0 and playing): `primary.light` fill, terracotta border, terracotta icon,
  `text.primary` name. Each card: icon row with tabular level ("66%" / "off"), name
  Quicksand 600/12.5, then a slider — 5px rail radius 3, terracotta fill, 13px round thumb
  with a 2px border in the card color.
- Row 3: "SCENES" label then scene chips — pill, 1px border, each with a 6-bar sparkline
  (3px bars, height = level × 0.13, terracotta when open) and the name; the loaded scene is
  tinted terracotta. Last chip is dashed: "+ Save this mix".

**The six sounds** (order fixed): Pages Turning · Rain on the Window · Wall Clock ·
Distant Whispers · Crackling Fireplace · Laptop Keyboard.
Descriptions used in the expanded sheet: "Paper, slow, irregular" · "Steady, on old glass" ·
"Pendulum, one per second" · "Two rooms away" · "Embers and the odd pop" ·
"Soft, unhurried typing".

### 4 — Ambience expanded (`screens/06-mixer-sheet.png`)

The strip opens into a 760px sheet (radius 18, `background.paper`, shadow lg) for building a
mix from scratch. Six rows, grid `36px / 180px / 1fr / 52px`, gap 18, each a radius-13 card
that tints when active: icon plate 36px radius 11, name + description, 6px slider, tabular
value. Header: "Ambience" + current scene + the hint "Arrow keys nudge by 4".

**MUI base:** `Drawer anchor="bottom"` or `Dialog`.

### 5 — History (`screens/07-history.png`)

**Purpose:** focus minutes over the last seven days.

Header: kicker "Week of 10 – 16 August", title Quicksand 600/30 "Seven quiet afternoons".
Three metric cards, radius 14, each on its own pastel tint with matching ink text:
6h 55m Total focus (terracotta tint) · 59m Daily average (sage) · 17 Sessions (lilac).
Numerals Quicksand 600/30, tabular; labels 10.5px 600 uppercase.

Chart: `1fr / 300px`. Seven bars, gap 26, max width 66px, 250px plot height, radius
`12 12 3 3`, solid pastel by magnitude — ≥90m `#c98a63`, ≥45m `#e0c0a6`, else `#efdccc`;
zero days render a 4px stub with an em-dash label. Value label above each bar (11.5px 600
tabular), weekday below (11.5px 600 uppercase, `divider` color when zero). 1px baseline.

Right rail (32px padding, 1px left divider): "SCENES USED" + three rows, each name/time then
a 6px rounded track — Rainy Reading Room 3h 20m 88% terracotta · Fireside Night 2h 05m 55%
sage · Quiet Stacks 1h 30m 38% lilac. Closing note: "Longest run was Tuesday: two hours,
rain and fireplace only."

### 6 — Shared rooms (`screens/08-shared-rooms.png`) — Phase 3

Header: "OPEN NOW" + "Sit with someone else" + "184 people reading across four rooms".
Four cards, `repeat(4,1fr)` gap 22, radius 16, `background.paper`, 1px divider. Each: a
128px gradient wash with a 30px Lucide icon, then padding 18 — kicker 10.5px 700 uppercase
in its own hue, name Quicksand 600/18, note 13px `text.secondary`, and a footer above a
hairline with a 25px avatar group (−7px overlap, 2px paper ring), a tabular count, and an
"Enter" pill.

| Room | Kicker | Note | Count | Wash |
|---|---|---|---|---|
| Silent Reading Room | No voices | Pages and a clock. Nothing else is allowed in here. | 62 reading | `#e8d9c4 → #b3a48d` |
| Rain in the West Wing | Weather | Heavy rain on tall windows, one lamp per table. | 48 reading | `#d3dbdc → #94a3a6` |
| Night Study | After hours | Firelight, low whispers, open until the small hours. | 51 reading | `#e2b98d → #8a6144` |
| The Typing Table | Working | Keyboards and coffee cups. Deadlines welcome. | 23 reading | `#dbe2d0 → #9fae8c` |

Presence is a quiet count and stacked avatars. No leaderboards, points or badges.

### 7 — MUI component map (`screens/09-mui-map.png`)
The screen-to-component table and the technical exceptions, rendered for the team.

---

## Interactions & behavior

- **Sliders** — pointer drag anywhere on the rail sets the value; arrows nudge 4,
  Shift+arrows 10, Home/End jump to 0/100. Changing any level marks the scene "Custom mix".
- **Sound card** — crossing 0 lights the card (tint + terracotta border + terracotta icon)
  with a 420ms transition. Level 0 or paused reads "off" and greys out.
- **Play/pause** — master transport; paused shows scene label "Paused" and dims every card.
- **Scenes** — clicking a chip loads all six levels and resumes playback. "+ Save this mix"
  stores the current six levels under an incrementing name; production should prompt for a
  name (Dialog with a `TextField`).
- **Day picker** — header button toggles the popover; picking a day swaps the task list and
  closes it; arrows move month without changing the selection; "Today" resets both.
  Should also close on outside click and Escape.
- **Tasks** — Enter or the add button appends to the selected day. Checkbox toggles done.
  "Focus" binds the task to the timer, resets it to the focus length and leaves it paused.
  Remove deletes immediately (no confirm at this size).
- **Timer** — 25/5 by default, counts down once per second while running. Phase switch resets
  the clock. The ring sweeps from empty to full over the phase.
- **Day/night** — one toggle repaints every surface. Respect `prefers-color-scheme` on first
  load, then remember the user's choice.
- **Responsive** — below 1100px the task list stacks under the timer and the ambience strip
  collapses to a single bar that opens the sheet. Below 720px the six sound cards go two-up.

## State

| State | Shape | Notes |
|---|---|---|
| `mode` | `'day' \| 'night'` | persisted per user |
| `playing` | boolean | master transport |
| `master` | 0–100 | |
| `levels` | `Record<SoundId, 0–100>` | six fixed ids |
| `scene` | string | current preset name or "Custom mix" |
| `presets` | `{ name, levels }[]` | server-persisted |
| `date` | ISO `YYYY-MM-DD` | selected day for notes |
| `calOpen`, `calMonth` | boolean, `YYYY-MM` | picker only |
| `tasksByDate` | `Record<ISODate, Task[]>` | `Task = { id, text, done, mins }` |
| `activeTask` | task id | the task bound to the timer |
| `pomoMode` | `'focus' \| 'break'` | |
| `remaining`, `running` | seconds, boolean | tick every 1000ms |

Fetching: tasks by date range (the picker needs to know which days have notes — return a set
of dates with counts for the visible month), presets per user, and daily focus totals for the
history week.

## Technical exceptions

1. **Two-tone progress ring** — `CircularProgress` has no track color. Stack a second
   `CircularProgress value={100}` underneath, or draw the SVG directly. Keep dasharray and
   dashoffset on the same circumference (666 at `r=106`).
2. **Sound cards that light up** — the tint-plus-border active state is a `styled('div')`
   reading `level > 0`; MUI has no such state.
3. **Day picker** — `Popover` anchored to the header button, containing
   `DateCalendar` from `@mui/x-date-pickers`; the note dot goes through `slotProps.day`.
   The prototype hand-rolls the grid, which is also acceptable if you would rather not add
   the picker dependency.
4. **Rounded fonts** — load both fontsource packages before `ThemeProvider`.
   Quicksand has no italic.
5. **Two themes, one tree** — `buildTheme(mode)` inside a single `ThemeProvider` with
   `CssBaseline`. Skip MUI `colorSchemes` so both pastel palettes stay hand-tuned.
6. **Photography** — the login plate and the four room washes are gradient placeholders.

## Assets

- Icons: Lucide (`lucide-react`). Used: book-open, cloud-rain, clock, message-circle-ish
  whisper glyph, flame, keyboard, calendar, chevron-down, chevron-left/right, plus, x, check,
  play, pause, sun, moon, volume-x.
- Fonts: Quicksand, Nunito (Google Fonts / fontsource).
- Images: none final. Six ambient audio loops still to be sourced (seamless, ≥60s, mono or
  stereo, normalized to −18 LUFS).

## Files in this bundle

```
design_handoff_focus_library/
├── README.md                        this document
├── TICKETS.md                       Jira-ready breakdown, one ticket per screen/component
├── theme.ts                         the MUI theme — copy into the codebase as-is
├── screens/                         PNG of every screen (day + night, picker open)
└── reference/
    ├── Focus Library.dc.html        interactive prototype — open in a browser
    └── support.js                   runtime the prototype needs
```
