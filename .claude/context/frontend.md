# Contexto do Frontend — Focus Library

Documento de contexto para quem implementa tickets de frontend (`FE-x` e `FL-x`). Resume o
que está espalhado em `Documentation/` e no código. **Fontes da verdade, em ordem:**

1. `Documentation/DESIGN.md` — tokens, medidas, copy (textos exatos) de cada tela,
   interações, state, exceções técnicas.
2. `Documentation/ROADMAP.md` — Parte 2 (backlog, dependências, anexos) e **Parte 3**
   (descrição e critérios de aceite de cada `FL-x`).
3. `Documentation/Design/screens/*.png` — prints de cada tela (abrir com a ferramenta Read,
   que mostra a imagem).
4. `Documentation/Design/reference/Focus Library.dc.html` — protótipo interativo (precisa do
   `support.js` ao lado). Útil para extrair medidas/CSS exatos com `grep`.

Se este arquivo e o `DESIGN.md` divergirem, **vale o `DESIGN.md`** (e atualize este arquivo).

---

## Produto em uma frase

Uma sala de leitura virtual, aconchegante, estilo biblioteca clássica: mixer de seis sons
ambiente, notas/tarefas por dia, Pomodoro vinculado a uma tarefa, histórico de foco e salas
compartilhadas. Modos dia e noite. Nada de visual "tech startup", azul/roxo neon ou
gamificação (pontos, badges, streaks, rankings).

## Stack e dependências instaladas

| Pacote | Uso |
|---|---|
| React 19 + TypeScript ~6 + Vite 8 | base (FE-1) |
| `@mui/material` 9.x + `@emotion/react` + `@emotion/styled` | componentes e tema (FL-1). O design fala em "MUI v6"; a API de tema é a mesma |
| `@fontsource/quicksand`, `@fontsource/nunito` | fontes (FL-1) |
| `react-router-dom` 7 | rotas (shell no FL-2) |
| `@tanstack/react-query` 5 | fetching/cache dos dados do backend |
| `axios` | cliente HTTP; base URL em `VITE_API_URL` (`frontend/.env.example`) |
| `lucide-react` | ícones (FL-2): `size={18}` inline / 16 em botões, `strokeWidth={1.6}` |
| `vitest` (dev) | testes unitários (FE-3): `npm test` = `vitest run`, ambiente `node` (sem jsdom) |

**Ainda não instalados, previstos pelo design/roadmap:** `@mui/x-date-pickers` (opcional no FL-8), Recharts
(opcional no FL-11; o gráfico pode ser feito à mão), Testing Library + jsdom (para testar
componentes), Playwright;
`@react-oauth/google` só na Epic D (FL-3). Instale só quando o ticket precisar.

## Estrutura e convenções do código

```
frontend/
├── index.html                 título "Focus Library"
├── src/
│   ├── main.tsx               carrega ./theme/fonts e envolve <App/> com <AppThemeProvider>
│   ├── App.tsx                só renderiza <AppRouter/>
│   ├── routes/AppRouter.tsx   createBrowserRouter: AppShell + / · /history · /rooms; '*' → '/'
│   ├── layout/                shell e header (FL-2)
│   │   ├── AppShell.tsx       AppHeader + <main><Outlet/></main>
│   │   ├── AppHeader.tsx      AppBar elevation 0, sticky, régua 1px, padding 16/26, gap 20
│   │   ├── BrandMark.tsx      marca "FL" 28px + wordmark (link para /)
│   │   ├── NavTabs.tsx        Tabs com Tab component={Link}; aba ativa derivada da URL (matchPath)
│   │   ├── navItems.ts        rótulos + rotas, na ordem do header
│   │   └── ColorModeToggle.tsx  IconButton 34×34, Sun/Moon do lucide, aria-label "Switch to … mode"
│   ├── api/                   cliente HTTP (FE-3)
│   │   ├── clientId.ts        getClientId(): UUID do navegador em localStorage
│   │   │                      ('focus-library:client-id'); inválido → gera outro; storage
│   │   │                      quebrado → id em memória; fallback sem crypto.randomUUID
│   │   ├── http.ts            instância axios `http` (baseURL = VITE_API_URL || :8000) +
│   │   │                      interceptor que põe `X-Client-Id` em toda requisição
│   │   ├── clients.ts         getCurrentClient() → GET /clients/me ({id, created_at, last_seen_at})
│   │   └── *.test.ts          testes Vitest ao lado do módulo
│   ├── vite-env.d.ts          tipagem de import.meta.env (VITE_API_URL)
│   ├── audio/                 motor de áudio headless + camada React (FL-4)
│   │   ├── sounds.ts          SOUND_IDS, SoundId, Levels, SOUNDS (id, label, description,
│   │   │                      src `/sounds/<id>.mp3`, ícone lucide), DEFAULT_LEVELS/MASTER
│   │   ├── engine.ts          createAmbienceEngine(): Web Audio sem React (store + ações)
│   │   ├── gesture.ts         onFirstGesture(): destrava o AudioContext no 1º gesto real
│   │   ├── AmbienceProvider.tsx  1 engine por app (montado no main.tsx, acima do router)
│   │   ├── ambienceContext.ts / useAmbience.ts  context + hook (useSyncExternalStore)
│   │   └── index.ts           barrel
│   ├── components/
│   │   └── ViewPlaceholder.tsx  kicker + título + nota, para views ainda não implementadas
│   ├── features/
│   │   ├── room/RoomPage.tsx          região superior placeholder (FL-7/10) + <AmbienceStrip/> embaixo
│   │   ├── mixer/                     ambience strip (FL-5)
│   │   │   ├── AmbienceStrip.tsx      Paper panel: ponto, legenda aria-live, master + play/pause, grid de 6 cards
│   │   │   ├── SoundCard.tsx          card que acende (420ms); Slider com setas ±4 / Shift ±10
│   │   │   └── mixerState.ts          lógica pura testada: isCardActive, countOpen, sceneName/sceneCaption, nudgeLevel
│   │   ├── history/HistoryPage.tsx    placeholder (FL-11)
│   │   └── rooms/SharedRoomsPage.tsx  placeholder (FL-12)
│   └── theme/
│       ├── theme.ts           buildTheme('day'|'night') — tokens + overrides de componentes
│       ├── AppThemeProvider.tsx  ThemeProvider + CssBaseline; modo inicial = prefers-color-scheme,
│       │                         escolha salva em localStorage ('focus-library:color-mode')
│       ├── colorModeContext.ts   Context { mode, setMode, toggleMode }
│       ├── useColorMode.ts       hook para ler/trocar o modo
│       ├── fonts.ts              imports do fontsource
│       └── index.ts              barrel: buildTheme, ColorMode, AppThemeProvider, useColorMode
```

- **Prettier**: aspas simples, ponto e vírgula, trailing comma, largura 100. ESLint com
  `typescript-eslint`, `react-hooks`, `react-refresh` (um `.tsx` deve exportar só componentes
  — por isso context/hook ficam em `.ts` separados). Husky + lint-staged rodam
  `eslint --fix` + `prettier` no commit.
- **Alias**: `@/*` → `src/*` (`paths` no `tsconfig.json` raiz **e** no `tsconfig.app.json` — o
  `tsc -b` só enxerga o segundo; + `vite-tsconfig-paths`).
- **Cor em `Typography`**: no MUI 9 a prop `color` aceita as chaves `textPrimary`,
  `textSecondary`, `textDisabled` (e `primary`, `success`...) — **não** `text.secondary` (esse
  valor é ignorado). Use `color="textSecondary"` ou `sx={{ color: 'text.secondary' }}`.
- **Imports do MUI** por caminho: `import Button from '@mui/material/Button'`.
- **Estilo**: sempre via tema (`sx`, `styled()`, `theme.palette.*`). **Nunca** hex solto no
  componente quando existe token. Cores extras do tema: `background.panel` e
  `palette.hairline`; variante tipográfica extra `timer`.
- Sugestão de organização para novos tickets (siga o que já existir no repo):
  `src/components/` (peças reutilizáveis), `src/features/<área>/` (room, mixer, notes, timer,
  history, rooms, auth), `src/api/` (axios + hooks do react-query), `src/routes/`.
  A pasta `src/components/teste/...` é um rascunho da usuária — não mexer.
- CI (`.github/workflows/ci.yml`): `npm ci`, `npm run lint`, `npm test`, `npm run build` (Node 24).
- **Áudio (FL-4)**: componentes usam só `useAmbience()` de `@/audio` →
  `{ levels, master, playing, status, unlocked, setLevel(id, v), applyLevels(levels),
  setMaster(v), play(), pause(), toggle() }`. Níveis são inteiros 0–100 (o engine faz clamp).
  Ids, nomes, descrições e ícones dos sons vêm de `SOUNDS`/`SOUNDS_BY_ID` (não duplicar).
  `applyLevels` não dá play — cena (FL-9) chama `applyLevels` + `play()`. "Ativo" no card =
  `levels[id] > 0 && playing`; `status[id]` é `idle|loading|ready|error` (erro só afeta a
  camada). Nunca criar `AudioContext` fora do engine nem fora de um gesto do usuário.
  Arquivos: `frontend/public/sounds/{pages,rain,clock,whispers,fire,keys}.mp3`.
- **Chamadas à API**: sempre pela instância `http` de `@/api/http` (nunca `axios` direto),
  para o `X-Client-Id` ir junto. Funções de API ficam em `src/api/<recurso>.ts`; testes
  trocam `http.defaults.adapter` em vez de usar rede.

## Design tokens (resumo — detalhes em DESIGN.md §"Design tokens")

### Cores

| Papel | Dia | Noite |
|---|---|---|
| `background.default` | `#f4ece0` | `#2b2421` |
| `background.paper` (superfície mais clara) | `#fbf6ee` | `#352d28` |
| `background.panel` | `#efe5d6` | `#241e1b` |
| `text.primary` | `#3d332b` | `#f1e7db` |
| `text.secondary` | `#7f7267` | `#a99a8c` |
| `divider` | `rgba(61,51,43,0.14)` | `rgba(241,231,219,0.16)` |
| `hairline` | `rgba(61,51,43,0.08)` | `rgba(241,231,219,0.09)` |
| `primary` (terracota) main / light (tint) / dark (tinta) | `#c98a63` / `#f0d9c8` / `#8a5334` | `#e3aa7d` / `#4a3a2e` |
| `success` (sage) main / light / dark | `#9fae8c` / `#e2e8d9` / `#5c6a4c` | `#a7b795` |
| `secondary` (lilás) main / light / dark | `#b3a4c2` / `#e5dfec` / `#5f5273` | `#bfb0cd` |

**Nunca `#ffffff`.** `#fbf6ee` é o teto. Texto sobre terracota sólido usa `#fbf6ee`.

### Tipografia

Quicksand (títulos, labels de UI, botões, numerais) + Nunito (corpo). Quicksand não tem
itálico. **Todos os numerais são tabulares** (`font-variant-numeric: tabular-nums`).

| Token | Fonte | Tam/Peso/Altura |
|---|---|---|
| h1 | Quicksand | 40 / 600 / 1.10, tracking −0.01em |
| h2 | Quicksand | 30 / 600 / 1.12 (headline do login: 48/600) |
| h3 | Quicksand | 24 / 600 / 1.20 (títulos de History/Rooms: 30) |
| h4 | Quicksand | 19 / 600 / 1.25 (header da lista: 26) |
| h5 | Quicksand | 16 / 600 / 1.30 |
| h6 | Quicksand | 12 / 700, uppercase, tracking 0.10em |
| body1 / body2 | Nunito | 15/1.7 · 13/1.6 |
| button | Quicksand | 14 / 600, sem uppercase |
| caption | Nunito | 11.5 / 1.5 |
| timer | Quicksand | 56 / 500 / 1.0, tabular |

### Espaçamento, raio, sombra, movimento, foco, ícones

- Base 8. Padding de tela 36–48, de card 16–18, gap de lista 9.
- Raios: 12 padrão · 999 botões/chips · 14 linhas de tarefa/cards de som · 16 cards/Paper ·
  18 sheets/dialogs/shells · 50% avatares/checkbox.
- Sombras ("sussurros"): `0 2px 10px rgba(61,51,43,.06)` → `0 4px 18px …09` →
  `0 10px 34px …14` (popover/sheet).
- Movimento lento: 420ms, `cubic-bezier(0.4,0,0.2,1)`. Sem snap, sem bounce, sem ripple.
  Respeitar `prefers-reduced-motion` (FL-14).
- Foco: `2px solid primary.main`, offset 2 — já global no tema.
- Ícones: Lucide, stroke 1.6, pontas arredondadas; 18px inline, 16px em botões, 30px nos
  washes das salas.

## Telas e imagens de referência

Abra o PNG do ticket **antes** de implementar e compare o resultado com ele no fim.

| Arquivo | O que mostra | Tickets |
|---|---|---|
| `Documentation/Design/screens/01-foundations.png` | Paleta e tipografia (referência, não é tela) | FL-1 |
| `Documentation/Design/screens/02-login.png` | Login: 2 colunas, Google + convidado — **fora da v1** | FL-3 (Epic D) |
| `Documentation/Design/screens/03-main-room-day.png` | Tela principal (dia): header, timer, lista do dia, ambience strip, cenas | FL-2, FL-5, FL-7, FL-9, FL-10 |
| `Documentation/Design/screens/04-day-picker.png` | Popover do seletor de dia | FL-8 |
| `Documentation/Design/screens/05-main-room-night.png` | Tela principal no modo noite | FL-1, FL-2, todos que pintam a sala |
| `Documentation/Design/screens/06-mixer-sheet.png` | Mixer expandido (sheet) | FL-6 |
| `Documentation/Design/screens/07-history.png` | Dashboard de histórico 7 dias | FL-11 |
| `Documentation/Design/screens/08-shared-rooms.png` | 4 salas compartilhadas | FL-12 |
| `Documentation/Design/screens/09-mui-map.png` | Mapa tela → componentes MUI + exceções | todos |

### Resumo por tela (medidas e copy exatos em DESIGN.md §"Telas")

- **Header (FL-2)**: padding 16/26, divider inferior 1px, sem sombra. Marca 28px raio 10
  `primary.light` "FL" + wordmark Quicksand 600/17. `Tabs` sem indicador; ativa = pill
  `primary.light` + texto terracota; rotas: The room · History · Shared rooms. Botão dia/noite
  34×34 raio 11 com divider, sol/lua terracota. Avatar 29px sobre `panel` + nome 12.5px —
  **na v1 o header não mostra avatar/nome** (sem login); volta na Epic D.
- **Login (FL-3 — fora da v1, Epic D)**: shell 1360×800 raio 18, colunas `1.05fr / 1fr`. Headline "Take the chair
  by the window." (48/600). Botão "Continue with Google" (pill tintada, ≥44px) e
  "Look around as a guest" (pill outlined). Plate de imagem raio 14 num mat de 8px —
  gradiente placeholder.
- **Sala (FL-5/7/9/10)**: corpo em `Grid 1fr / 1.42fr` (timer menor à esquerda, lista maior à
  direita, divider 1px entre eles) + ambience strip de largura total embaixo.
  - Timer: anel 236px, trilho/progresso 11px, `r=106`, **circunferência 666** (dasharray e
    offset iguais), terracota no foco / sage na pausa; relógio 56/500; botões Start/Pause/Resume,
    Reset, Skip to break; 6 pontos de sessão + "3 of 6 sessions · 1h 15m".
  - Lista: o header é o botão do seletor de dia ("Today" ou "August 16, 2026", 26/600) +
    "{n} left"; campo "Add a task…" + botão 44px; linhas raio 14 (ativa tintada, pendente
    paper, concluída transparente riscada); pill "Focus"/"In focus"/"Done"; estado vazio e
    footer com o texto do DESIGN.md.
  - Ambience strip: fundo `panel`, 6 cards `repeat(6,1fr)` gap 12, card ativo =
    `primary.light` + borda terracota; slider 5px, thumb 13px; master 132px + play/pause 44px;
    ponto pulsante; chips de cena com sparkline de 6 barras + chip tracejado "+ Save this mix".
  - Seis sons, ordem fixa: Pages Turning · Rain on the Window · Wall Clock · Distant Whispers ·
    Crackling Fireplace · Laptop Keyboard.
- **Day picker (FL-8)**: Popover 286px raio 16, células 34px raio 10, selecionado terracota,
  hoje tint, ponto de 4px nos dias com notas, footer "A dot marks a day with notes" + "Today".
- **Mixer sheet (FL-6)**: 760px, raio 18, 6 linhas grid `36px / 180px / 1fr / 52px`, dica
  "Arrow keys nudge by 4".
- **History (FL-11)**: 3 cards de métrica em tints (terracota/sage/lilás); 7 barras raio
  `12 12 3 3`, cor por magnitude (≥90m `#c98a63`, ≥45m `#e0c0a6`, senão `#efdccc`), dia zerado =
  stub de 4px com travessão; coluna "SCENES USED".
- **Shared rooms (FL-12)**: 4 cards `repeat(4,1fr)` gap 22, wash de 128px + ícone 30px,
  `AvatarGroup` 25px, contagem tabular, pill "Enter". Nomes/notas/washes na tabela do DESIGN.md.

## Interações-chave

- Sliders: arrastar em qualquer ponto; setas ±4, Shift ±10, Home/End 0/100. Mudar um nível →
  cena vira "Custom mix".
- Card de som acende ao passar de 0 (420ms). Pausado → "Paused" e todos os cards escurecem.
- Day picker: escolher dia troca a lista e fecha; setas do mês não mudam a seleção; Escape e
  clique fora fecham.
- Tarefas: Enter adiciona na data selecionada; "Focus" vincula ao timer e reseta pausado;
  remover não pede confirmação.
- Timer: 25/5, tick a cada 1s, troca de fase reseta o relógio.
- Responsivo: <1100px lista abaixo do timer e strip vira barra que abre a sheet; <720px
  cards de som em 2 colunas e picker vira Dialog full-width.
- **Regra: responsivo em todo ticket.** Todo componente/tela já nasce funcionando em celular
  (≥360px), tablet (768px) e desktop: mobile-first, breakpoints do tema, sem rolagem
  horizontal, alvos ≥44px. Verifique com prints em 390, 768, 1024 e 1440px. FL-13 só valida
  e ajusta o conjunto; não é onde o responsivo começa.

## State previsto (DESIGN.md §"State")

`mode` · `playing` · `master` 0–100 · `levels: Record<SoundId, 0–100>` · `scene` ·
`presets: {name, levels}[]` (servidor) · `date` ISO · `calOpen`, `calMonth` ·
`tasksByDate: Record<ISODate, Task[]>` com `Task = { id, text, done, mins }` · `activeTask` ·
`pomoMode: 'focus' | 'break'` · `remaining`, `running`.

Fetching: tarefas por intervalo de data (com contagem por dia do mês visível para os pontos do
picker), presets por usuário, totais diários de foco da semana. Na v1, "usuário" = ID
anônimo do navegador (header `X-Client-Id`, ver FE-3).

## Exceções técnicas do MUI

1. Anel de duas cores: dois `CircularProgress` empilhados (um `value={100}`) ou SVG direto.
2. Card de som que acende: `styled('div')` lendo `level > 0`.
3. Day picker: `Popover` + `DateCalendar` (`@mui/x-date-pickers`, ponto via `slotProps.day`)
   ou grade feita à mão.
4. Fontes carregadas antes do `ThemeProvider` (feito).
5. Um único `ThemeProvider` com `buildTheme(mode)`, sem `colorSchemes` (feito).
6. Fotografia: placeholders de gradiente (login e salas).

## Tickets de frontend (ordem e dependências — ROADMAP Parte 2)

| ID | O quê | Depende de | Print |
|---|---|---|---|
| FE-1 ✅ | Scaffold Vite + React + TS | BE-1 | — |
| FL-1 ✅ (PR #7) | Tema, fontes, dia/noite | FE-1 | 01 |
| FL-2 ✅ | App shell + header + rotas | FL-1 | 03 |
| FE-3 ✅ | ID anônimo do navegador (UUID no localStorage + header `X-Client-Id` no axios) | FE-1 | — |
| FL-4 ✅ | Audio engine (Web Audio, 6 loops) | FL-1 | — |
| FL-5 ✅ | Ambience strip (mixer) | FL-4, FL-2 | 03 |
| FL-6 ✅ | Mixer expandido (sheet) | FL-5 | 06 |
| FL-7 ✅ | Lista de notas por dia (`features/notes/`, `api/tasks.ts`, QueryClientProvider em `main.tsx`; `date` é estado em `RoomPage`, FL-8 assume) | FL-2, FE-3, BE-13 | 03 |
| FL-8 | Day picker | FL-7 | 04 |
| FL-9 | Cenas (presets) | FL-5, FE-3, BE-15 | 03 |
| FL-13 / FL-14 | Responsivo / acessibilidade (MVP) | vários | — |
| FL-10 | Pomodoro vinculado à nota | FL-7, BE-19 | 03 |
| FL-11 | Dashboard de histórico | BE-20 | 07 |
| FL-12 | Salas compartilhadas | BE-25, BE-27, FL-2 | 08 |
| FL-13b/c, FL-14b/c | Checks de responsivo/a11y por fase | — | — |
| FL-3, FE-2 (Epic D) | Login com Google + contexto de auth — **fora da v1** | BE-7, BE-9 | 02 |

Os critérios de aceite de cada `FL-x` estão na Parte 3 do ROADMAP — trate-os como checklist
obrigatório.

## Escopo da v1: sem login

Decidido em outubro/2026 (ROADMAP Parte 2, "Mudança de escopo"):

- Não existe login nem tela de login na v1: o app abre direto em The room (`/`).
- Cada navegador tem um **ID anônimo** (UUID gerado no primeiro acesso, no `localStorage`),
  enviado em toda chamada à API no header `X-Client-Id` (FE-3). É ele que separa os dados
  de cada pessoa no backend.
- O header **não mostra avatar nem nome** na v1: termina no botão dia/noite. O `UserBadge` e
  o usuário fixo "Marina/MB" do FL-2 foram removidos; estão no histórico do git (PR #9) se a
  Epic D quiser reaproveitar.
- FL-3 (login) e FE-2 (contexto de auth) foram para a Epic D, depois do MVP.

## Decisões já tomadas (não refazer)

- O `theme.ts` original do bundle de design nunca foi commitado; o atual foi reconstruído a
  partir do DESIGN.md (FL-1). Tints noturnos de sage/lilás foram derivados.
- Modo dia/noite persiste em localStorage (na v1 não há perfil); sincronizar com a conta só
  na Epic D.
- Aba ativa do header usa a cor do override de `MuiTab` do tema (`primary.dark` no dia, por
  contraste), não o `#c98a63` do protótipo; marca "FL" e sol/lua usam `primary.main`.
- `GET /sounds` foi removido: os 6 áudios são assets estáticos do frontend (FL-4).
- Áudio (FL-4): curva de volume `gain = (nível/100)²` em cada camada e no master; toda
  mudança é rampa linear de 120ms. Estado inicial = protótipo (Rainy Reading Room, master 72)
  mas **pausado** ("Sound plays only when you ask"). O `AudioContext` nasce no 1º gesto
  (pointer/tecla com `navigator.userActivation.isActive`) ou no `play()`; arquivos são
  buscados uma única vez, quando a camada tem nível > 0 e o contexto existe. Nível 0 só
  zera o gain (fonte e buffer continuam). Pause faz fade e suspende o contexto após a rampa.
  Loop via `AudioBufferSourceNode.loop` com `loopStart/loopEnd` pulando o padding de silêncio
  do MP3.
- Mixer (FL-5): a strip usa só `useAmbience()`. Setas dos sliders são tratadas em
  `onKeyDownCapture` (`arrowKeyHandler`, ±4 / Shift ±10, step MUI = 1) e não chegam ao MUI;
  Home/End/PageUp/PageDown continuam do MUI. Nome da cena é derivado enquanto FL-9 não existe:
  níveis == `DEFAULT_LEVELS` → "Rainy Reading Room", senão "Custom mix"; pausado → "Paused". A
  contagem "n of six open" conta níveis > 0 mesmo pausado (como o protótipo). FL-9 deve trocar
  `sceneName` por cena carregada/preset. A linha SCENES (chips) é do FL-9, não existe ainda.
  Clique no card (ícone + nome, `ButtonBase` irmão do slider, rótulo "Mute/Unmute {som}") faz
  `toggleMute`: nível > 0 → 0 guardando o nível; 0 → último não-zero (ou `DEFAULT_LEVELS`, ou 50).
  A memória (`LastLevels`) vive no hook `useMixer()` (`features/mixer/useMixer.ts`:
  `useAmbience()` + `toggleSound(id)`), chamado uma vez no `AmbienceStrip`, que passa o objeto
  `mixer` para a `MixerSheet` (FL-6): sem níveis duplicados, memória única. A sheet é um
  `Drawer anchor="bottom"` (paper 760px centralizado, raio 18 no topo, aria-labelledby) aberto
  pelo botão "Expand mixer" (Maximize2) ao lado da legenda da strip; estado `open` local da
  strip. Linhas (`SoundRow`) espelham o tint dos cards, com botão de mute irmão do slider. O
  master não aparece na sheet (o design não mostra).

## Responsivo (passada pós-FL-6)

- Header: padding/gap menores no `xs`; wordmark some abaixo de `sm` (a marca "FL" continua com
  `aria-label`); `NavTabs` é `variant="scrollable"` (rolagem interna só nas tabs, sem botões);
  toggle dia/noite 44px no `xs`. `AppShell` usa `100dvh`.
- `AmbienceStrip`: abaixo de 1100px (`WIDE` em `AmbienceStrip.tsx`) vira barra única — ponto,
  título/legenda (quebra de linha livre), botão expandir 44px e play 44px; cards e master só
  aparecem ≥1100px (por isso a regra de 2 colunas <720 ficou sem efeito: os cards não existem
  ali). Padding inferior respeita `env(safe-area-inset-bottom)`.
- `MixerSheet`: `maxHeight: calc(100dvh - 24px)` com rolagem interna; no `xs` a linha é
  [plate+nome/descrição | valor] sobre slider de largura total (alvo 44px, thumb 20px em
  `pointer: coarse`); de `sm` em diante o grid de 4 colunas do design.
- Verificação headless: o Edge `--headless` impõe largura mínima ~500px, então para 360/390
  use um HTML temporário com `<iframe>` na largura desejada servido de `frontend/public/`
  (apague depois). `--force-dark-mode` é invertido/instável; use `--user-data-dir` novo por captura.
