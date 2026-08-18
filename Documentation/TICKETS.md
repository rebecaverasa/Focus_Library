# Focus Library — implementation tickets

Ready to paste into Jira. One epic, then tickets grouped by phase. Each ticket names the
screenshot to attach, the MUI components to build on, and its acceptance criteria.
Estimates are relative points, not days.

Read `README.md` first — it holds every token, measurement and copy string referenced below.

---

## EPIC: Focus Library — virtual reading room

A focus app themed as a cozy classical library: ambient sound mixer, per-day notes, Pomodoro
timer, focus history, shared rooms. React + TypeScript + MUI v6, custom theme, day and night
modes. Design reference: this bundle.

---

## Phase 0 — Foundation

### FL-1 · Theme and typography setup
**Points:** 3 · **Attach:** `screens/01-foundations.png`

Install and wire the custom MUI theme so no screen ever renders MUI defaults.

- Add `@mui/material`, `@emotion/react`, `@emotion/styled`, `@fontsource/quicksand`,
  `@fontsource/nunito`.
- Drop in `theme.ts` from this bundle unchanged. Wrap the app in `ThemeProvider` +
  `CssBaseline` with `buildTheme(mode)`.
- Day/night context with a `useColorMode()` hook; initial value from
  `prefers-color-scheme`, then persisted to the user profile.

**Acceptance**
- No Roboto and no Material blue anywhere in the rendered app.
- No `#ffffff` surface in either mode (`background.paper` is `#fbf6ee` on day).
- Headings render Quicksand 600, body Nunito, all figures tabular.
- Keyboard focus shows the 2px terracotta ring, never the browser default.
- Toggling mode repaints every surface with no layout shift.

### FL-2 · App shell and header
**Points:** 3 · **Attach:** `screens/03-main-room-day.png`

- `AppBar elevation={0}` + `Toolbar`, 1px bottom divider, no shadow.
- Brand mark (28px, radius 10, `primary.light`, "FL") + wordmark Quicksand 600/17.
- `Tabs` with the indicator disabled — active tab is a pill with `primary.light` fill;
  routes: The room · History · Shared rooms.
- Day/night `IconButton` (34px, radius 11, 1px divider, sun/moon).
- `Avatar` 29px + user name.
- Routing shell for the three views.

**Acceptance:** active tab reads as a tinted pill; header is 1px-ruled, never shadowed;
mode toggle works from the header on every route.

---

## Phase 1 — MVP

### FL-3 · Login screen
**Points:** 3 · **Attach:** `screens/02-login.png`

Two-column layout (`1.05fr / 1fr`), Google OAuth, guest entry.

- Copy exactly as in README §Screens/2 — headline, body, fine print.
- Primary pill button with the Google glyph; secondary outlined pill for guest.
- Right column: image plate, radius 14, inside an 8px mat + 1px outline. Gradient
  placeholder until real photography lands.

**Acceptance:** successful Google sign-in lands on The room; guest entry works with an
in-memory session; buttons are ≥44px tall; layout holds at 1280 and 1440.

### FL-4 · Audio engine — six looping layers
**Points:** 8 · **Attach:** — (no UI)

Headless audio foundation for the mixer.

- Web Audio: one `GainNode` per sound into a master `GainNode`.
- Six seamless loops: pages, rain, clock, whispers, fire, keys. Normalize to −18 LUFS,
  ≥60s each, preload lazily on first unmute.
- Volume 0–100 mapped to gain with a perceptual curve; 120ms ramp on change so no clicks.
- Master play/pause; `AudioContext` resume on first user gesture; keep playing when the tab
  is hidden.

**Acceptance:** loops are click-free at the seam; a slider change is audible within 150ms;
level 0 releases nothing but silences the layer; no console warnings about autoplay.

### FL-5 · Ambience strip (mixer)
**Points:** 5 · **Attach:** `screens/03-main-room-day.png`

The six-card strip along the bottom of the room, plus master transport.

- `Paper` on the panel color, 1px top divider, padding 22/26/24.
- Six cards in `Grid repeat(6,1fr)` gap 12, radius 14. Active state
  (`level > 0 && playing`) = `primary.light` fill + terracotta border + terracotta icon;
  inactive = `background.paper` + divider + `text.secondary`.
- `Slider` per card: 5px rail, terracotta track, 13px solid thumb with a 2px card-colored
  ring. Arrow keys ±4, Shift ±10, Home/End.
- Master slider (132px, tabular %) + 44px round tinted play/pause.
- Pulsing terracotta dot, "Ambience", and the live "{scene} · {n} of six open" caption.

**Acceptance:** cards light and dim with a 420ms transition; keyboard-only operation works on
all seven sliders with visible focus; paused state greys every card and labels the scene
"Paused"; strip occupies the bottom band only — the timer and list keep the upper region.

### FL-6 · Ambience expanded sheet
**Points:** 3 · **Attach:** `screens/06-mixer-sheet.png`

760px `Drawer anchor="bottom"` (or `Dialog`), radius 18, shadow lg. Six rows with icon
plate, name + description, 6px slider, tabular value. Header shows the scene and the hint
"Arrow keys nudge by 4".

**Acceptance:** opens from the strip and closes on Escape / backdrop click; shares state with
the strip (no duplicated levels); rows tint on active exactly like the cards.

### FL-7 · Per-day notes list
**Points:** 5 · **Attach:** `screens/03-main-room-day.png`

The larger of the two body columns. Notes belong to a date.

- `List` of radius-14 rows: 22px round `Checkbox` (fills sage when done), text 15.5px over
  11px meta, "Focus" pill, remove `IconButton`.
- Add `TextField` (radius 12, placeholder "Add a task…") + 44px tinted add button; Enter
  submits.
- Row states: active task = `primary.light` + terracotta border; pending =
  `background.paper` + divider; done = transparent, strikethrough, `text.secondary`.
- Empty state copy: "No notes for {Past day / Upcoming}. Add the first one above."
- Footer: sage dot + "Completing a task ends its session and logs the minutes".
- Persist per `(userId, date)`.

**Acceptance:** add / complete / remove all persist across reload; the column is visibly
wider than the timer column (`1fr / 1.42fr`); "{n} left" counts only unfinished notes for the
selected day; hit targets ≥44px.

### FL-8 · Day picker on the list header
**Points:** 5 · **Attach:** `screens/04-day-picker.png`

The list header is the date control — this is how the user reaches another day's notes.

- Header button: day label (Quicksand 600/26 — "Today", else "August 16, 2026") + a tinted
  pill with a calendar icon and chevron.
- `Popover` anchored to it, 286px, radius 16, shadow lg, offset 52px.
  `DateCalendar` from `@mui/x-date-pickers` themed to match, or the hand-rolled grid from the
  prototype.
- Day cells 34px, radius 10: selected = terracotta fill / `#fbf6ee` text; today =
  `primary.light`; **days that hold notes show a 4px terracotta dot** (`slotProps.day`).
- Month arrows (28px, radius 9) navigate without changing the selection. Footer: the legend
  "A dot marks a day with notes" + a "Today" reset pill.
- Endpoint: note counts for the visible month, so dots are correct before opening a day.

**Acceptance:** picking a day swaps the list and closes the popover; Escape and outside click
close it; the dot appears only on days with at least one note; the popover never clips the
panel edge; arrow keys move between days and Enter selects.

### FL-9 · Scenes (presets)
**Points:** 5 · **Attach:** `screens/03-main-room-day.png`

Save and reload a six-level combination.

- Scene chips: pill, 1px border, 6-bar sparkline (3px bars, height = level × 0.13,
  terracotta when open) + name; loaded scene is tinted terracotta.
- "+ Save this mix" dashed chip → `Dialog` with a `TextField` for the name (the prototype
  auto-names; production prompts).
- Rename and delete from a chip context menu.
- Seed three: Rainy Reading Room (rain 66 / pages 34 / clock 24), Fireside Night
  (fire 74 / rain 40 / pages 12), Quiet Stacks (keys 46 / whispers 38 / pages 20 / clock 16).

**Acceptance:** loading a scene sets all six levels and resumes playback; any manual change
switches the label to "Custom mix"; scenes persist per user; the sparkline reflects the saved
levels, not the live ones.

---

## Phase 2

### FL-10 · Pomodoro timer bound to a note
**Points:** 5 · **Attach:** `screens/03-main-room-day.png`

The left body column.

- 236px ring: 11px track, 11px terracotta progress (sage on break), round cap.
  **Circumference is 666 at `r=106` — dasharray and dashoffset must use the same value.**
  Two stacked `CircularProgress` (one at `value={100}`) or a direct SVG.
- Clock Quicksand 500/56 tabular; phase label 12px 600 uppercase.
- Controls: Start/Pause/Resume (tinted pill), Reset (outlined pill), Skip to break /
  Back to focus (text button).
- 25/5 default, configurable focus length. Ticks once per second, survives tab blur.
- Bound to the note tapped "Focus"; the ticket's kicker shows the task name.
- Six session dots + "3 of 6 sessions · 1h 15m".

**Acceptance:** the ring is empty at full time and full at zero, sweeping smoothly (no jump
or wrap); phase switch resets the clock and recolors the ring sage; completing the bound note
ends the session and logs its minutes; the timer column stays the narrower of the two.

### FL-11 · History dashboard
**Points:** 5 · **Attach:** `screens/07-history.png`

Seven-day focus minutes.

- Three metric cards on pastel tints (terracotta / sage / lilac) with matching ink text.
- Seven bars, radius `12 12 3 3`, solid pastel by magnitude (≥90m `#c98a63`, ≥45m `#e0c0a6`,
  else `#efdccc`); zero days a 4px stub with an em-dash. Value above, weekday below, 1px
  baseline. No chart-library default colors.
- Right rail: scenes used, name/time + 6px rounded pastel track.
- Endpoint: daily focus totals and per-scene totals for the week.

**Acceptance:** matches the pastel palette exactly — no neon defaults; empty week renders
stubs without breaking the axis; figures are tabular; the week range in the kicker follows
the data.

---

## Phase 3

### FL-12 · Shared rooms
**Points:** 8 · **Attach:** `screens/08-shared-rooms.png`

Four themed rooms with live presence.

- `Card` radius 16 with a 128px gradient wash + 30px icon, kicker in its own hue, name,
  note, then a footer with `AvatarGroup` (−7px overlap, 2px paper ring), a tabular count,
  and an "Enter" pill.
- Four rooms with the exact names, notes, counts and washes in README §Screens/6.
- Realtime presence (websocket or polling); entering a room loads its scene.
- Header total: "184 people reading across four rooms".

**Acceptance:** counts update live without a full re-render; entering applies the room's six
levels; presence is a count and avatars only — no points, badges or ranking anywhere.

---

## Cross-cutting

### FL-13 · Responsive behavior
**Points:** 3

Below 1100px the notes list stacks under the timer and the ambience strip collapses to a
single bar that opens the sheet (FL-6). Below 720px the sound cards go two-up and the day
picker becomes a full-width `Dialog`.

**Acceptance:** no horizontal scroll at 768, 1024, 1280, 1440; the timer never grows past the
notes list on desktop; every control stays ≥44px.

### FL-14 · Accessibility pass
**Points:** 3

Sliders carry `role="slider"` with `aria-valuenow` / `aria-label`; the day picker is a
labelled dialog with arrow-key navigation; the timer announces phase changes via a polite
live region; visible focus everywhere; the pulsing ambience dot and every transition respect
`prefers-reduced-motion`.

**Acceptance:** full keyboard operation of mixer, notes, picker and timer; axe reports no
critical issues in both modes; text contrast ≥4.5:1 (ink-on-tint pairs in README are already
tuned for this).
