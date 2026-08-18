# Focus Library — Documentação de Design

# Parte 1 — Prompt original para o Claude Design

Quero que você projete a interface completa (UI) de um produto chamado **Focus Library** — uma biblioteca/sala de estudos virtual voltada para foco e produtividade, inspirada em sites como imissmycafe.com, mas com tema de **biblioteca clássica/aconchegante** em vez de café.

## Sensação e atmosfera desejada

A interface deve transmitir uma sensação de **conforto, aconchego e concentração silenciosa** — como estar sentado numa poltrona confortável numa biblioteca antiga, numa tarde chuvosa, com uma lareira acesa ao fundo. Pense em:

- Tons quentes e terrosos: madeira, âmbar, creme, marrom café, verde musgo escuro, dourado envelhecido
- Texturas sutis que remetam a papel, couro, madeira (sem pesar a performance)
- Tipografia que misture uma fonte serifada acolhedora para títulos (algo como Lora, Merriweather ou Playfair Display) com uma sans-serif limpa para textos funcionais (Inter, Nunito ou similar)
- Iluminação visual "quente" — evitar tons frios, brancos puros ou azuis clínicos
- Micro-interações suaves e lentas (nada de animações abruptas ou "gamificadas") — tudo deve parecer calmo, deliberado, sem pressa
- Deve funcionar bem tanto em modo claro (dia, luz suave) quanto em modo escuro (noite, luz de lareira) — se possível, projete os dois modos

O oposto do que eu quero: interfaces frias, corporativas, tech-startup genéricas, com azul/roxo neon, cards flutuantes agressivos ou gamificação com pontos/badges chamativos.

> **Nota**: a paleta e tipografia efetivamente entregues (Quicksand + Nunito, tons terracota/âmbar/sage) estão detalhadas na Parte 2, seção "Design tokens" — o resultado final diverge levemente da sugestão inicial de fontes (Lora/Merriweather/Playfair) descrita acima.

## Stack técnica (restrição importante)

O frontend será construído em **React + TypeScript usando Material UI (MUI)** como biblioteca de componentes base. Isso significa:

- Quero que você **personalize o tema do Material UI** (via `ThemeProvider`, paleta de cores customizada, tipografia customizada, `overrides`/`styleOverrides` dos componentes) para atingir a estética aconchegante descrita acima — não quero a aparência "padrão MUI" (Roboto + azul Material Design genérico).
- Onde o Material UI tiver limitações (por exemplo, formas de componentes muito rígidas, sombras muito "flat", cantos muito retos), pode sugerir customizações via `sx` prop, `styled()` ou CSS adicional — mas mantendo os componentes MUI como base estrutural (não reinventar componentes do zero).
- Ao entregar os designs, indique quais componentes MUI cada tela usa como base (ex: `Card`, `Slider`, `Drawer`, `Dialog`, `Chip`) e como o tema customizado se aplica a eles.
- Se alguma parte do design exigir algo que o MUI não suporta bem nativamente, aponte isso explicitamente como uma exceção/observação técnica.

## Funcionalidades que precisam de tela/componente

### Fase 1 (MVP) — prioridade máxima no design agora
1. **Tela de Login** — botão "Entrar com Google", com boas-vindas acolhedora (frase de efeito, ilustração ou ícone temático de biblioteca)
2. **Mixer de sons ambiente** — tela principal do app. Precisa de controles de volume independentes para: páginas virando, chuva na janela, relógio de parede, sussurros ao fundo, lareira crepitando, teclado de laptop. Cada som deve ter um ícone/ilustração temática e um slider de volume. Pense em como tornar isso visualmente interessante sem poluir (ex: cards com ícones que "acendem"/ganham destaque quando o volume está ativo)
3. **To-do list** — lista de tarefas simples, com adicionar/completar/remover, integrada visualmente ao restante da tela (talvez como painel lateral ou gaveta retrátil, tipo `Drawer` do MUI)
4. **Presets** — interface para salvar a combinação atual de volumes com um nome e carregá-la depois (ex: um menu de "cenas salvas" com preview/nome)

### Fase 2 — desenhar como próxima etapa
5. **Timer Pomodoro** — vinculado a uma tarefa da to-do list, com estados de foco (25min) e pausa (5min), indicador visual de progresso (radial ou linear)
6. **Dashboard de histórico** — gráfico simples mostrando minutos de foco por dia (últimos 7 dias), estilizado com a mesma paleta quente (nada de gráficos com cores neon padrão de biblioteca de charts)

### Fase 3 — desenhar como visão futura
7. **Lista de salas compartilhadas** — cards de salas temáticas (ex: "Sala de Leitura Silenciosa", "Chuva na Ala Oeste", "Sala de Estudos Noturna") mostrando quantas pessoas estão estudando ali em tempo real (indicador de presença, tipo avatares empilhados ou contador discreto)

## Estrutura de navegação

Pense em uma navegação simples e não intrusiva — provavelmente um layout de app single-page com:
- Header/topbar minimalista (logo, avatar do usuário, talvez toggle dark/light mode)
- Área central dedicada ao mixer de sons (o coração do produto)
- To-do list e presets acessíveis via painel lateral ou gaveta, para não competir visualmente com o mixer
- Navegação para dashboard/salas via um menu discreto (não precisa ser uma sidebar pesada estilo dashboard corporativo)

## Entregáveis esperados

1. Paleta de cores completa (light + dark mode) com códigos hex
2. Tipografia (famílias, pesos, tamanhos para h1-h6, body, caption)
3. Tela de Login
4. Tela principal (Mixer + To-do + Presets integrados)
5. Tela de Dashboard (Fase 2)
6. Tela de Salas Compartilhadas (Fase 3)
7. Especificação de como o tema do MUI deve ser configurado (createTheme customizado) para que eu possa implementar exatamente o que foi desenhado

Priorize qualidade e coerência visual acima de quantidade — prefiro poucas telas muito bem resolvidas a muitas telas genéricas.

**Fim do prompt.**

---

# Parte 2 — Handoff de Design (entregue pelo Claude Design)

## Sobre os arquivos de design

Tudo neste pacote é uma **referência de design em HTML** — um protótipo que mostra a
aparência e o comportamento pretendidos. Não é código de produção para copiar. A tarefa é
recriar essas telas no codebase alvo: **React + TypeScript + Material UI (MUI v6)**, usando
`Design/theme.ts` (se presente neste diretório) como a fonte única de verdade visual.

- `Design/reference/Focus Library.dc.html` é o protótipo interativo (abra num navegador —
  sliders, tarefas, seletor de dia, timer e o toggle dia/noite funcionam).
- `Design/screens/` guarda um PNG de cada tela.
- Os tickets de implementação (Jira-ready), um por tela/componente, com critérios de aceite,
  estão em `Documentation/ROADMAP.md` (Parte 3 — Tickets de Design Detalhados, FL-1 a FL-14).

## Fidelidade

**Alta fidelidade.** Cores, tipografia, espaçamento, raios e copy são finais. Recriar
pixel-close usando componentes MUI com o tema customizado aplicado — não restilizar do zero
e não entregar com os defaults do MUI (Roboto / azul Material).

Duas coisas estão intencionalmente incompletas:
- **Fotografia** é placeholder (plate do login, washes dos cards de sala compartilhada).
  Imagens reais pendentes.
- **Arquivos de som** não estão incluídos. Seis loops são necessários (ver ticket FL-4 no
  roadmap).

## Design tokens

Todos os valores vivem em `theme.ts`. Reproduzidos aqui para referência.

### Cor — Dia (padrão)

| Papel | Hex | Uso |
|---|---|---|
| `background.default` | `#f4ece0` | fundo do app (aveia quente) |
| `background.paper` | `#fbf6ee` | cards, inputs, popovers — **a superfície mais clara do produto** |
| panel | `#efe5d6` | ambience strip, preenchimento de avatar |
| `text.primary` | `#3d332b` | corpo de texto |
| `text.secondary` | `#7f7267` | meta, legendas |
| divider | `rgba(61,51,43,0.14)` | bordas de 1px |
| hairline | `rgba(61,51,43,0.08)` | trilhos de slider, regras internas |
| `primary.main` (terracota) | `#c98a63` | estado ativo, anel, sliders |
| `primary.light` | `#f0d9c8` | preenchimentos tintados: botões, tarefa ativa, card de som ativo |
| `primary.dark` (tinta) | `#8a5334` | texto sobre tint terracota |
| `success.main` (sage) | `#9fae8c` | tarefas completas, fase de pausa |
| `success.light` | `#e2e8d9` | tint sage |
| `success.dark` | `#5c6a4c` | texto sobre tint sage |
| `secondary.main` (lilás) | `#b3a4c2` | terceira série de dados |
| `secondary.light` | `#e5dfec` | tint lilás |
| `secondary.dark` | `#5f5273` | texto sobre tint lilás |

**Nunca usar `#ffffff`.** Branco puro foi rejeitado por ser desconfortável; `#fbf6ee` é o teto.

### Cor — Noite

| Papel | Hex |
|---|---|
| `background.default` | `#2b2421` |
| `background.paper` | `#352d28` |
| panel | `#241e1b` |
| `text.primary` | `#f1e7db` |
| `text.secondary` | `#a99a8c` |
| divider | `rgba(241,231,219,0.16)` |
| hairline | `rgba(241,231,219,0.09)` |
| primary (terracota) | `#e3aa7d`, tint `#4a3a2e` |
| success (sage) | `#a7b795` |
| secondary (lilás) | `#bfb0cd` |

### Tipografia

Quicksand (títulos, labels de UI, numerais) sobre Nunito (corpo). Carregar via
`@fontsource/quicksand` (400/500/600/700) e `@fontsource/nunito` (300/400/500/600 + itálico).
Quicksand não tem itálico — ênfase usa apenas peso.

| Token | Família | Tamanho | Peso | Altura de linha | Notas |
|---|---|---|---|---|---|
| h1 | Quicksand | 40 | 600 | 1.10 | letter-spacing −0.01em |
| h2 | Quicksand | 30 | 600 | 1.12 | headline do login roda a 48/600 |
| h3 | Quicksand | 24 | 600 | 1.20 | títulos de tela (History, Rooms) rodam a 30 |
| h4 | Quicksand | 19 | 600 | 1.25 | header da lista roda a 26 |
| h5 | Quicksand | 16 | 600 | 1.30 | |
| h6 | Quicksand | 12 | 700 | 1.30 | uppercase, tracking 0.10em |
| body1 | Nunito | 15 | 400 | 1.70 | |
| body2 | Nunito | 13 | 400 | 1.60 | |
| button | Quicksand | 14 | 600 | — | sem uppercase |
| caption | Nunito | 11.5 | 400 | 1.50 | |
| numerais do timer | Quicksand | 56 | 500 | 1.0 | `font-variant-numeric: tabular-nums` |

Todos os numerais (timer, porcentagens, contadores, labels de gráfico) são tabulares.

### Espaçamento, raio, sombra, movimento

- Espaçamento base `8`. Padding de tela 36–48px, padding de card 16–18px, gap de lista 9px.
- Raio: `12` padrão · `999` botões e chips · `14` linhas de tarefa / cards de som ·
  `16` cards e Paper · `18` sheets, dialogs, shells de tela · `50%` avatares, checkboxes.
- Sombras são sussurros: `0 2px 10px rgba(61,51,43,.06)` → `0 4px 18px rgba(61,51,43,.09)` →
  `0 10px 34px rgba(61,51,43,.14)` (popover / sheet).
- Movimento é lento e deliberado. `standard: 420ms`, ease `cubic-bezier(0.4,0,0.2,1)`.
  Nada de snap, nada de bounce, sem feedback gamificado.
- Anel de foco: `2px solid primary.main`, offset 2. Nunca o default do navegador.

### Ícones

Lucide, espessura de traço 1.6, pontas e junções arredondadas. 18px inline, 16px em botões,
30px nos washes dos cards de sala compartilhada.

## Telas

### 1 — Foundations (`Design/screens/01-foundations.png`)
Não é uma tela de produto. A referência de paleta e tipografia para o time.

### 2 — Login (`Design/screens/02-login.png`)

**Propósito:** entrar com Google, ou dar uma olhada como convidado.

**Layout:** shell 1360×800, raio 18. Duas colunas `1.05fr / 1fr`. Coluna esquerda com padding
64, `space-between` (marca no topo / bloco de copy no meio / fine print embaixo). Coluna
direita é `background.paper` com padding 32 segurando um plate de imagem em raio 14 dentro de
um mat de 8px na cor de superfície mais um contorno de 1px.

**Componentes**
- Marca: 32×32, raio 10, preenchimento `primary.light`, "FL" em Quicksand 700/14 terracota;
  wordmark Quicksand 600/18.
- Kicker: 11.5px, 700, uppercase, tracking 0.14em, terracota.
- Headline: Quicksand 600/48, altura de linha 1.08 — "Take the chair by the window."
- Corpo: Nunito 16/1.7, `text.secondary`, máx 44ch —
  "The rain is already on. Sign in and the room remembers your timer, your list, and the scenes you keep coming back to."
- Botão primário: pill, preenchimento `primary.light`, borda terracota 1px, texto `#8a5334`,
  14.5px, altura mín 44, glifo do Google 17px — "Continue with Google".
- Botão secundário: pill, transparente, divider 1px — "Look around as a guest".
- Fine print, 11.5px `text.secondary`: "No ads. No streaks." · "Sound plays only when you ask."

**Base MUI:** `Stack`, `Button`, `Typography`, `Box`.

### 3 — The room (`Design/screens/03-main-room-day.png`, noite: `Design/screens/05-main-room-night.png`)

A tela principal. Três regiões: header, corpo de duas colunas, ambience strip.

**Header** — padding 16/26, divider inferior 1px.
Marca 28px · nav (`Tabs`): tab ativa é uma pill com preenchimento `primary.light` e texto
terracota, inativa é `text.secondary` 13.5px · `IconButton` dia/noite 34×34, raio 11, divider
1px, sol/lua terracota · avatar 29px círculo sobre preenchimento panel + nome 12.5px.

**Corpo** — `Grid` `1fr / 1.42fr`. A lista de tarefas é deliberadamente a coluna maior; o
timer é a menor. Um divider de 1px separa as duas.

**Esquerda — Pomodoro** (padding 36/32/40, centralizado, gap 22)
- Kicker 11px 700 uppercase terracota: "Session three · focusing on" (pausa: "Break · next up").
- Nome da tarefa ativa, Quicksand 600/17.
- Anel: 236×236. Trilho 11px `rgba(...,0.08)`; progresso 11px terracota (sage na pausa),
  ponta arredondada, `r=106`, circunferência **666** — dasharray e offset precisam usar o
  mesmo valor. Disco interno `background.paper` com inset de 16px.
- Relógio: Quicksand 500/56, tabular. Label de fase 12px 600 uppercase `text.secondary`.
- Botões: "Start focus / Pause / Resume" (pill, tintada, largura mín 118), "Reset" (pill,
  outlined), "Skip to break / Back to focus" (text button, terracota).
- Pontos de sessão: seis círculos de 11px, borda terracota 1px, preenchidos quando completos;
  "3 of 6 sessions · 1h 15m", acima de uma régua hairline.

**Direita — Lista de notas, por dia** (padding 36/40/40, gap 18)
- **O header é o controle de data.** O label do dia (Quicksand 600/26 — "Today", senão
  "August 16, 2026") mais uma pill com ícone de calendário e um chevron; o conjunto todo é um
  botão que abre o seletor de dia. Lado direito: "{n} left", 11.5px tabular.
- Popover do seletor de dia (`Design/screens/04-day-picker.png`): 286px, raio 16,
  `background.paper`, divider 1px, sombra `0 10px 34px rgba(61,51,43,.14)`, offset 52px abaixo
  do header, z-index 20. Título do mês Quicksand 600/14 entre dois botões de seta de 28px
  (raio 9). Linha de dias da semana 10px 700 `text.secondary`. Células de dia 34px de altura,
  raio 10: selecionado = preenchimento terracota com texto `#fbf6ee`, hoje = preenchimento
  `primary.light`, dias com notas mostram um ponto terracota de 4px sob o numeral. Footer:
  "A dot marks a day with notes" + uma pill "Today" de reset.
- Campo de adicionar: `TextField` sobre `background.paper`, raio 12, placeholder
  "Add a task…", Enter envia; botão de adicionar quadrado tintado 44px com ícone de mais.
- Linha de tarefa: raio 14, padding 16px, gap 13. Fundo — tarefa ativa `primary.light` com
  borda terracota, pendente `background.paper` com borda divider, concluída transparente.
  Esquerda: checkbox redondo 22px, borda 1.5px, preenche sage com check `#fbf6ee` quando
  concluída. Meio: texto da tarefa 15.5px (strikethrough + `text.secondary` quando concluída)
  sobre meta 11px ("25m estimate" / "50m logged"). Direita: uma pill "Focus" —
  preenchimento terracota com texto `#fbf6ee` quando é a tarefa ativa ("In focus"), outlined
  caso contrário, "Done" quando completa — depois um botão de remover 24px.
- Estado vazio: "No notes for {Past day / Upcoming}. Add the first one above." num card
  `background.paper`, raio 13, centralizado.
- Footer hairline: ponto sage + "Completing a task ends its session and logs the minutes".

**Ambience strip** — largura total, fundo panel, divider superior 1px, padding 22/26/24.
- Linha 1: ponto terracota pulsante (4s ease-in-out opacidade 0.5→0.95), "Ambience" Quicksand
  600/14, depois "{scene} · {n} of six open" 11.5px; lado direito com slider master (132px de
  largura, label "Master" + % tabular) e um botão play/pause redondo 44px, tintado.
- Linha 2: seis cards de som numa grid `repeat(6,1fr)`, gap 12. Raio de card 14, padding
  13/14. Inativo: `background.paper` + borda divider, ícone e nome `text.secondary`.
  Ativo (level > 0 e tocando): preenchimento `primary.light`, borda terracota, ícone terracota,
  nome `text.primary`. Cada card: linha de ícone com nível tabular ("66%" / "off"), nome
  Quicksand 600/12.5, depois um slider — trilho 5px raio 3, preenchimento terracota, thumb
  redondo 13px com borda de 2px na cor do card.
- Linha 3: label "SCENES" e depois chips de cena — pill, borda 1px, cada um com um sparkline
  de 6 barras (barras de 3px, altura = level × 0.13, terracota quando ativa) e o nome; a cena
  carregada é tintada terracota. O último chip é tracejado: "+ Save this mix".

**Os seis sons** (ordem fixa): Pages Turning · Rain on the Window · Wall Clock ·
Distant Whispers · Crackling Fireplace · Laptop Keyboard.
Descrições usadas na sheet expandida: "Paper, slow, irregular" · "Steady, on old glass" ·
"Pendulum, one per second" · "Two rooms away" · "Embers and the odd pop" ·
"Soft, unhurried typing".

### 4 — Ambience expanded (`Design/screens/06-mixer-sheet.png`)

A strip abre numa sheet de 760px (raio 18, `background.paper`, sombra lg) para montar um mix
do zero. Seis linhas, grid `36px / 180px / 1fr / 52px`, gap 18, cada uma um card raio-13 que
tinta quando ativo: plate de ícone 36px raio 11, nome + descrição, slider de 6px, valor
tabular. Header: "Ambience" + cena atual + a dica "Arrow keys nudge by 4".

**Base MUI:** `Drawer anchor="bottom"` ou `Dialog`.

### 5 — History (`Design/screens/07-history.png`)

**Propósito:** minutos de foco nos últimos sete dias.

Header: kicker "Week of 10 – 16 August", título Quicksand 600/30 "Seven quiet afternoons".
Três cards de métrica, raio 14, cada um sobre seu próprio tint pastel com texto de tinta
correspondente: 6h 55m Total focus (tint terracota) · 59m Daily average (sage) · 17 Sessions
(lilás). Numerais Quicksand 600/30, tabulares; labels 10.5px 600 uppercase.

Gráfico: `1fr / 300px`. Sete barras, gap 26, largura máx 66px, altura de plot 250px, raio
`12 12 3 3`, pastel sólido por magnitude — ≥90m `#c98a63`, ≥45m `#e0c0a6`, senão `#efdccc`;
dias zerados renderizam um stub de 4px com um travessão. Label de valor acima de cada barra
(11.5px 600 tabular), dia da semana abaixo (11.5px 600 uppercase, cor `divider` quando zero).
Baseline de 1px.

Coluna direita (padding 32, divider esquerdo 1px): "SCENES USED" + três linhas, cada
nome/tempo depois uma trilha arredondada de 6px — Rainy Reading Room 3h 20m 88% terracota ·
Fireside Night 2h 05m 55% sage · Quiet Stacks 1h 30m 38% lilás. Nota de fechamento:
"Longest run was Tuesday: two hours, rain and fireplace only."

### 6 — Shared rooms (`Design/screens/08-shared-rooms.png`) — Fase 3

Header: "OPEN NOW" + "Sit with someone else" + "184 people reading across four rooms".
Quatro cards, `repeat(4,1fr)` gap 22, raio 16, `background.paper`, divider 1px. Cada um: um
wash de gradiente de 128px com um ícone Lucide de 30px, depois padding 18 — kicker 10.5px 700
uppercase em sua própria cor, nome Quicksand 600/18, nota 13px `text.secondary`, e um footer
acima de uma hairline com um avatar group de 25px (overlap −7px, anel paper de 2px), uma
contagem tabular, e uma pill "Enter".

| Sala | Kicker | Nota | Contagem | Wash |
|---|---|---|---|---|
| Silent Reading Room | No voices | Pages and a clock. Nothing else is allowed in here. | 62 reading | `#e8d9c4 → #b3a48d` |
| Rain in the West Wing | Weather | Heavy rain on tall windows, one lamp per table. | 48 reading | `#d3dbdc → #94a3a6` |
| Night Study | After hours | Firelight, low whispers, open until the small hours. | 51 reading | `#e2b98d → #8a6144` |
| The Typing Table | Working | Keyboards and coffee cups. Deadlines welcome. | 23 reading | `#dbe2d0 → #9fae8c` |

Presença é uma contagem discreta e avatares empilhados. Sem leaderboards, pontos ou badges.

### 7 — MUI component map (`Design/screens/09-mui-map.png`)
A tabela de tela-para-componente e as exceções técnicas, renderizadas para o time.

## Interações & comportamento

- **Sliders** — arrastar o ponteiro em qualquer lugar do trilho define o valor; setas movem 4,
  Shift+setas 10, Home/End pulam para 0/100. Mudar qualquer nível marca a cena como "Custom mix".
- **Card de som** — cruzar 0 acende o card (tint + borda terracota + ícone terracota) com
  transição de 420ms. Nível 0 ou pausado mostra "off" e escurece.
- **Play/pause** — transporte master; pausado mostra label de cena "Paused" e escurece todos
  os cards.
- **Scenes** — clicar num chip carrega os seis níveis e retoma a reprodução. "+ Save this mix"
  guarda os seis níveis atuais sob um nome incremental; produção deve pedir um nome
  (Dialog com um `TextField`).
- **Day picker** — o botão do header alterna o popover; escolher um dia troca a lista de
  tarefas e fecha o popover; setas movem o mês sem mudar a seleção; "Today" reseta ambos.
  Deve também fechar ao clicar fora e com Escape.
- **Tasks** — Enter ou o botão de adicionar inclui na data selecionada. Checkbox alterna
  concluído. "Focus" vincula a tarefa ao timer, reseta para a duração de foco e deixa pausado.
  Remover deleta imediatamente (sem confirmação nesse tamanho).
- **Timer** — 25/5 por padrão, conta regressivamente uma vez por segundo enquanto roda.
  Trocar de fase reseta o relógio. O anel varre de vazio a cheio ao longo da fase.
- **Dia/noite** — um toggle repinta toda superfície. Respeitar `prefers-color-scheme` no
  primeiro load, depois lembrar a escolha do usuário.
- **Responsivo** — abaixo de 1100px a lista de tarefas empilha sob o timer e a ambience strip
  colapsa numa única barra que abre a sheet. Abaixo de 720px os seis cards de som viram
  duas colunas.

## State

| State | Formato | Notas |
|---|---|---|
| `mode` | `'day' \| 'night'` | persistido por usuário |
| `playing` | boolean | transporte master |
| `master` | 0–100 | |
| `levels` | `Record<SoundId, 0–100>` | seis ids fixos |
| `scene` | string | nome do preset atual ou "Custom mix" |
| `presets` | `{ name, levels }[]` | persistido no servidor |
| `date` | ISO `YYYY-MM-DD` | dia selecionado para notas |
| `calOpen`, `calMonth` | boolean, `YYYY-MM` | apenas do picker |
| `tasksByDate` | `Record<ISODate, Task[]>` | `Task = { id, text, done, mins }` |
| `activeTask` | id de tarefa | a tarefa vinculada ao timer |
| `pomoMode` | `'focus' \| 'break'` | |
| `remaining`, `running` | segundos, boolean | tick a cada 1000ms |

Fetching: tarefas por intervalo de data (o picker precisa saber quais dias têm notas —
retornar um conjunto de datas com contagens para o mês visível), presets por usuário, e
totais diários de foco para a semana do histórico.

## Exceções técnicas

1. **Anel de progresso de duas cores** — `CircularProgress` não tem cor de trilho. Empilhar
   um segundo `CircularProgress value={100}` por baixo, ou desenhar o SVG diretamente. Manter
   dasharray e dashoffset na mesma circunferência (666 em `r=106`).
2. **Cards de som que acendem** — o estado ativo de tint-mais-borda é um `styled('div')`
   lendo `level > 0`; o MUI não tem esse estado nativamente.
3. **Day picker** — `Popover` ancorado no botão do header, contendo `DateCalendar` de
   `@mui/x-date-pickers`; o ponto de nota passa por `slotProps.day`. O protótipo desenha a
   grid à mão, o que também é aceitável se preferirem não adicionar a dependência do picker.
4. **Fontes arredondadas** — carregar os dois pacotes fontsource antes do `ThemeProvider`.
   Quicksand não tem itálico.
5. **Dois temas, uma árvore** — `buildTheme(mode)` dentro de um único `ThemeProvider` com
   `CssBaseline`. Pular o `colorSchemes` do MUI para que as duas paletas pastel fiquem
   ajustadas manualmente.
6. **Fotografia** — o plate do login e os quatro washes de sala são placeholders de gradiente.

## Assets

- Ícones: Lucide (`lucide-react`). Usados: book-open, cloud-rain, clock, glifo estilo
  message-circle para sussurro, flame, keyboard, calendar, chevron-down, chevron-left/right,
  plus, x, check, play, pause, sun, moon, volume-x.
- Fontes: Quicksand, Nunito (Google Fonts / fontsource).
- Imagens: nenhuma final. Seis loops de áudio ambiente ainda precisam ser providenciados
  (seamless, ≥60s, mono ou stereo, normalizados a −18 LUFS).

## Arquivos deste pacote de design

Estrutura original do bundle de design (conforme entregue pelo Claude Design):

```
design_handoff_focus_library/
├── README.md                        este documento (na época, a raiz do bundle de design)
├── TICKETS.md                       breakdown Jira-ready, um ticket por tela/componente
├── theme.ts                         o tema MUI — copiar para o codebase como está
├── screens/                         PNG de cada tela (dia + noite, picker aberto)
└── reference/
    ├── Focus Library.dc.html        protótipo interativo — abrir num navegador
    └── support.js                   runtime que o protótipo precisa
```

No repositório atual, esses arquivos vivem em `Documentation/Design/` (`screens/`,
`reference/`), e o conteúdo de `README.md`/`TICKETS.md` foi reorganizado: a especificação de
design está aqui em `Documentation/DESIGN.md`, e os tickets de implementação estão em
`Documentation/ROADMAP.md`.
