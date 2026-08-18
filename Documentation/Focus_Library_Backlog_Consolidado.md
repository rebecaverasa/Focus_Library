# Focus Library — Backlog Consolidado para Jira (verasfocus)

**Fonte**: mescla do plano de implementação original (E1-E6) com os tickets de design
(`TICKETS.md`, FL-1 a FL-14) recebidos do Claude Design.

**Estrutura**: 3 Epics por fase. Story Points em escala Fibonacci (1, 2, 3, 5, 8).

**Convenção de IDs neste documento** (referência interna, não precisa virar o ID real do
Jira — o Jira vai gerar KAN-1, KAN-2, etc. na ordem de criação):
- `BE-x` → ticket novo, de backend/infra, que eu adicionei para cobrir o que os tickets
  `FL-x` (focados em UI) não cobrem.
- `FE-x` → ticket novo, de scaffolding de frontend, que antecede o tema (FL-1).
- `FL-x` → ticket original do design (`TICKETS.md`), mantido com a mesma descrição e
  critérios de aceite, apenas renumerado/reagrupado por epic.

---

## 🎯 EPICS

| Epic | Nome | Objetivo | Prioridade |
|------|------|----------|-----------|
| **Epic A** | Fase 0-1 — Fundação & MVP | Ambiente, auth, mixer, tarefas e presets funcionando ponta a ponta | 🔴 P0 |
| **Epic B** | Fase 2 — Produtividade & Analytics | Pomodoro vinculado a tarefas, histórico, resumo semanal | 🟠 P1 |
| **Epic C** | Fase 3 — Salas Compartilhadas | Presença em tempo real em salas temáticas | 🟡 P2 |

---

## 📊 EPIC A — Fase 0-1: Fundação & MVP

| ID | Summary | Tipo | Pontos | Labels | Depende de | Attach |
|----|---------|------|--------|--------|-----------|--------|
| BE-1 | Estrutura de pastas do monorepo (backend/frontend/docker) | Setup | 2 | `setup` | — | — |
| BE-2 | Docker + docker-compose (FastAPI + Postgres + Redis) | Setup | 5 | `setup` | BE-1 | — |
| BE-3 | Setup backend: FastAPI + Alembic | Setup | 5 | `setup`,`backend` | BE-2 | — |
| FE-1 | Setup frontend: scaffold Vite + React + TypeScript | Setup | 3 | `setup`,`frontend` | BE-1 | — |
| BE-4 | CI: GitHub Actions (lint, testes, build da imagem) | Setup | 5 | `setup` | BE-3, FE-1 | — |
| BE-5 | Schema inicial do banco + migrations (Alembic) | Setup | 3 | `setup`,`backend` | BE-2, BE-3 | — |
| FL-1 | Theme and typography setup — wire `theme.ts`, fontes, dark/light mode | Frontend | 3 | `frontend` | FE-1 | `01-foundations.png` |
| FL-2 | App shell and header (AppBar, Tabs, avatar, toggle dia/noite) | Frontend | 3 | `frontend` | FL-1 | `03-main-room-day.png` |
| BE-6 | Google Cloud Console: configurar OAuth2 (Client ID, consent screen) | Setup | 2 | `setup` | — | — |
| BE-7 | Backend: rota `POST /auth/google` (valida JWT do Google) | Backend | 5 | `backend` | BE-3, BE-6 | — |
| BE-8 | Backend: modelo `User` + upsert por `google_sub` | Backend | 3 | `backend` | BE-5, BE-7 | — |
| BE-9 | Backend: emissão de JWT próprio (access + refresh) | Backend | 5 | `backend` | BE-8 | — |
| BE-10 | Backend: middleware de autenticação (`@require_auth`) | Backend | 3 | `backend` | BE-9 | — |
| FL-3 | Login screen — Google OAuth + entrada como convidado | Frontend | 3 | `frontend` | FL-2, BE-7 | `02-login.png` |
| FE-2 | Auth context/hook global + proteção de rotas | Frontend | 3 | `frontend` | FL-3, BE-9 | — |
| BE-11 | Testes pytest: `/auth/google` + validação de JWT | Testes | 3 | `test`,`backend` | BE-10 | — |
| FL-4 | Audio engine — seis camadas em loop (Web Audio API) | Frontend | 8 | `frontend` | FL-1 | — |
| FL-5 | Ambience strip (mixer) — 6 cards + master transport | Frontend | 5 | `frontend` | FL-4, FE-2 | `03-main-room-day.png` |
| FL-6 | Ambience expanded sheet (mixer em tela cheia) | Frontend | 3 | `frontend` | FL-5 | `06-mixer-sheet.png` |
| BE-12 | Backend: modelo `Task` (por data, `user_id`, `mins` logados) | Backend | 3 | `backend` | BE-5, BE-8 | — |
| BE-13 | Backend: CRUD endpoints `/tasks` (GET por data, POST, PATCH, DELETE) | Backend | 5 | `backend` | BE-12, BE-10 | — |
| FL-7 | Per-day notes list (lista de tarefas do dia selecionado) | Frontend | 5 | `frontend` | FL-2, FE-2, BE-13 | `03-main-room-day.png` |
| FL-8 | Day picker no header da lista (popover + calendário) | Frontend | 5 | `frontend` | FL-7 | `04-day-picker.png` |
| BE-14 | Backend: modelo `Preset` (nome + 6 níveis) | Backend | 3 | `backend` | BE-5, BE-8 | — |
| BE-15 | Backend: CRUD endpoints `/presets` | Backend | 5 | `backend` | BE-14, BE-10 | — |
| FL-9 | Scenes (presets) — salvar/carregar combinação de volumes | Frontend | 5 | `frontend` | FL-5, BE-15 | `03-main-room-day.png` |
| BE-16 | Testes pytest: CRUD de tasks + presets | Testes | 3 | `test`,`backend` | BE-13, BE-15 | — |
| FL-13 | Responsive behavior (MVP: mixer, lista, picker) | Frontend | 3 | `frontend` | FL-5, FL-7, FL-8 | — |
| FL-14 | Accessibility pass (MVP: mixer, lista, picker, login) | Frontend | 3 | `frontend`,`a11y` | FL-3, FL-5, FL-7, FL-8, FL-9 | — |

**Total Epic A**: 28 tickets · **~99 pontos**

**Saída da Epic A**: usuário faz login com Google, mixa os 6 sons, gerencia tarefas por
dia, salva/carrega presets — tudo persistido no Postgres, com a UI final (não mockup).

---

## 📊 EPIC B — Fase 2: Produtividade & Analytics

| ID | Summary | Tipo | Pontos | Labels | Depende de | Attach |
|----|---------|------|--------|--------|-----------|--------|
| BE-17 | Setup RabbitMQ + Celery + Celery Beat | Setup | 5 | `setup`,`backend` | BE-2 | — |
| BE-18 | Backend: modelo `FocusSession` (task_id, duration, started/ended_at) | Backend | 3 | `backend` | BE-5, BE-12 | — |
| BE-19 | Backend: endpoints iniciar/pausar/finalizar sessão de foco | Backend | 5 | `backend` | BE-18, BE-10 | — |
| BE-20 | Backend: rota `GET /stats` (minutos de foco por dia/semana) | Backend | 3 | `backend` | BE-18 | — |
| FL-10 | Pomodoro timer bound to a note — anel de progresso 236px, 25/5 | Frontend | 5 | `frontend` | FL-7, BE-19 | `03-main-room-day.png` |
| BE-21 | Testes pytest: `FocusSession` CRUD + cálculo de stats | Testes | 3 | `test`,`backend` | BE-19, BE-20 | — |
| FL-11 | History dashboard — 7 dias, métricas + gráfico de barras | Frontend | 5 | `frontend` | BE-20 | `07-history.png` |
| BE-22 | Backend: job Celery para resumo semanal (Telegram Bot API) | Backend | 5 | `backend` | BE-17, BE-20 | — |
| FL-13b | Responsive check — timer + dashboard | Frontend | 1 | `frontend` | FL-10, FL-11 | — |
| FL-14b | Accessibility check — timer + dashboard (live region de fase) | Frontend | 1 | `frontend`,`a11y` | FL-10, FL-11 | — |

**Total Epic B**: 10 tickets · **~36 pontos**

**Saída da Epic B**: Pomodoro vinculado à tarefa em foco, dashboard com histórico de 7
dias, resumo semanal automático via Telegram.

---

## 📊 EPIC C — Fase 3: Salas Compartilhadas

| ID | Summary | Tipo | Pontos | Labels | Depende de | Attach |
|----|---------|------|--------|--------|-----------|--------|
| BE-23 | Backend: modelo `Room` (nome, tema, contagem atual) | Backend | 3 | `backend` | BE-5 | — |
| BE-24 | Backend: setup WebSocket em FastAPI | Setup | 5 | `setup`,`backend` | BE-3 | — |
| BE-25 | Backend: rota `GET /rooms` (listar salas) | Backend | 3 | `backend` | BE-23, BE-10 | — |
| BE-26 | Backend: endpoint `POST /rooms/{id}/join` | Backend | 5 | `backend` | BE-23, BE-10 | — |
| BE-27 | Backend: WebSocket `join_room` — broadcast de contagem para a sala | Backend | 5 | `backend` | BE-24, BE-26 | — |
| BE-28 | Backend: Redis Pub/Sub — sincronizar contagem entre réplicas | Backend | 5 | `backend` | BE-2, BE-27 | — |
| FL-12 | Shared rooms — 4 cards temáticos, presença em tempo real | Frontend | 8 | `frontend` | BE-25, BE-27, FL-2 | `08-shared-rooms.png` |
| BE-29 | Testes pytest: lógica de `join_room` | Testes | 3 | `test`,`backend` | BE-26, BE-27 | — |
| FL-13c | Responsive check — salas compartilhadas | Frontend | 1 | `frontend` | FL-12 | — |
| FL-14c | Accessibility check — salas compartilhadas | Frontend | 1 | `frontend`,`a11y` | FL-12 | — |

**Total Epic C**: 10 tickets · **~39 pontos**

**Saída da Epic C**: 4 salas temáticas com presença em tempo real via WebSocket + Redis
Pub/Sub, sem gamificação (só contagem e avatares).

---

## 🔗 Notas de reconciliação (o que mudou em relação ao seu plano original)

- **FL-3 (Login) já inclui** o botão Google + fluxo de guest visualmente — por isso os
  antigos `E2-6/E2-7` (setup do botão, chamada ao backend) foram absorvidos dentro de
  FL-3. O que sobrou como ticket próprio foi `FE-2` (contexto de auth global + proteção
  de rotas), porque isso é uma preocupação de app inteiro, não só da tela de login.
- **FL-4 (Audio engine) já inclui** a tarefa antiga `E3-1` (providenciar os 6 arquivos de
  áudio) como parte do próprio ticket — não precisa de um ticket separado.
- **`E3-2` (backend `GET /sounds`) foi removido**: o design trata os 6 sons como assets
  estáticos do frontend (Web Audio API, preload local), não como algo servido por API.
  Se no futuro vocês quiserem hospedar os áudios em CDN/S3 com metadados, dá para
  reintroduzir esse ticket na Fase 2 ou 3.
- **FL-7, FL-8 e FL-9 já cobrem toda a UI** de tarefas, seletor de dia e presets — os
  antigos `E4-5, E4-6, E4-7, E4-9, E4-10` (frontend) foram descartados porque o design
  já é muito mais específico (inclusive em relação a onde os dados ficam: presets e
  tarefas por dia, com contagem de minutos).
- **FL-10 e FL-11 substituem** os antigos `E5-4, E5-5, E5-6, E5-7, E5-9` (frontend do
  Pomodoro e dashboard) pelo mesmo motivo.
- **FL-12 substitui** os antigos `E6-7` a `E6-11` e `E6-13` (frontend de salas).
- **Accessibility (FL-14) e Responsive (FL-13) foram desdobrados em 3 tickets cada**
  (um por fase: `FL-13/FL-14`, `FL-13b/FL-14b`, `FL-13c/FL-14c`) para não virarem um
  ticket gigante no fim do projeto — cada fase valida sua própria fatia antes de avançar.

---

## 📝 RESUMO GERAL

| Epic | Tickets | Story Points |
|------|---------|---------------|
| Epic A — Fundação & MVP | 28 | ~99 |
| Epic B — Produtividade & Analytics | 10 | ~36 |
| Epic C — Salas Compartilhadas | 10 | ~39 |
| **Total** | **48** | **~174** |

---

## 🏷️ Labels (padronizadas)

`setup` · `backend` · `frontend` · `test` · `a11y` · `bugfix` · `enhancement` · `documentation`

## 📎 Anexos por ticket

Onde a coluna "Attach" tem um arquivo, anexe o PNG correspondente de `screens/` (do
pacote de design) ao criar o ticket no Jira — ajuda muito quem for implementar.

---

## 🚀 Como isso vira tickets no Jira

**Opção 1 — MCP do Jira conectado** (assim que o conector "Atlassian" estiver
habilitado neste chat, eu crio os 3 Epics + 48 tickets automaticamente, já com
labels, story points e a descrição/critério de aceite de cada um, e linko as
dependências via "is blocked by"/"blocks").

**Opção 2 — Import CSV manual** (não depende de conector, pode ser feito agora): gerei
também um arquivo `focus_library_jira_import.csv` pronto para o importador nativo do
Jira (Configurações do projeto → System → External System Import → CSV). Você mapeia as
colunas na tela de import (Summary, Issue Type, Epic Name/Epic Link, Priority, Labels,
Story Points, Description) e ele cria tudo de uma vez.

---

**Aguardando sua revisão.** Faz sentido essa reconciliação? Quer que eu ajuste a
prioridade de algum ticket, remova algo, ou já parto para gerar o CSV/aguardar o
conector do Jira?
