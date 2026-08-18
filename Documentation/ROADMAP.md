# Focus Library — Roadmap

# Parte 1 — Plano de Implementação Original (Kanban, E1–E6)

**Data**: Agosto 2026
**Projeto**: Focus Library (Biblioteca Virtual de Estudos)
**Stack**: Python + FastAPI | React + TypeScript | PostgreSQL | Redis | RabbitMQ | Celery

## 📋 Sumário Executivo

Este documento organiza o desenvolvimento em **3 Fases**, distribuídas em **6 Epics**, totalizando **~35-40 tasks** de Small/Medium.

- **Fase 1 (MVP)**: Mixer de sons + Login Google + To-do + Presets
- **Fase 2**: Pomodoro + Dashboard + Resumo semanal
- **Fase 3**: Salas compartilhadas (tempo real)

Estrutura: **4 Categorias de Tasks**
- 🔧 **Setup/Infra** (ambiente, Docker, CI/CD)
- 🔙 **Backend** (FastAPI, DB, Auth)
- 🎨 **Frontend** (React/TS, UI, integração)
- 🧪 **Testes & QA** (pytest, Vitest, E2E)

## 🎯 EPICS (Agrupamentos principais)

| Epic | Descrição | Fase | Prioridade |
|------|-----------|------|-----------|
| **E1: Setup & Infra** | Ambiente dev local, Docker, estrutura inicial | 1 | 🔴 P0 |
| **E2: Autenticação OAuth2** | Login Google, JWT, persistência de usuário | 1 | 🔴 P0 |
| **E3: Mixer de Sons** | Backend + Frontend do mixer de áudio | 1 | 🔴 P0 |
| **E4: To-do & Presets** | CRUD de tasks, sistema de presets de som | 1 | 🟠 P1 |
| **E5: Pomodoro & Analytics** | Timer de foco, histórico, dashboard | 2 | 🟠 P1 |
| **E6: Salas Compartilhadas** | WebSocket, Redis Pub/Sub, presença real-time | 3 | 🟡 P2 |

## 📊 FASE 1: MVP (Semanas 1-4)

### Epic E1: Setup & Infra 🔧

**Objetivo**: Ambiente local funcional, estrutura de projeto pronta para código.

#### Tasks:

| ID | Task | Tipo | Esforço | Deps | Status |
|----|------|------|---------|------|--------|
| E1-1 | Criar estrutura de pastas (backend, frontend, docker) | Setup | Small | — | 📌 |
| E1-2 | Configurar Docker + docker-compose (FastAPI + Postgres + Redis) | Setup | Medium | E1-1 | 📌 |
| E1-3 | Setup do backend: poetry/pip, FastAPI com alembic | Setup | Medium | E1-2 | 📌 |
| E1-4 | Setup do frontend: Vite + React + TypeScript + Material-UI | Setup | Medium | E1-1 | 📌 |
| E1-5 | Configurar GitHub Actions (lint, test no PR) | Setup | Medium | E1-3, E1-4 | 🔵 |
| E1-6 | Setup do banco: schema inicial com migrations | Setup | Small | E1-2, E1-3 | 📌 |

**Bloqueadores**: Nenhum
**Entrada em Dev**: Pode começar imediatamente
**Saída**: Repo pronto, docker-compose sobe FastAPI + React + Postgres localmente

### Epic E2: Autenticação OAuth2 🔐

**Objetivo**: Usuários podem fazer login com Google e manter sessão persistente.

#### Tasks:

| ID | Task | Tipo | Esforço | Deps | Status |
|----|------|------|---------|------|--------|
| E2-1 | Configurar Google Cloud Console (OAuth2 credentials) | Setup | Small | — | 📌 |
| E2-2 | **Backend**: Rota POST /auth/google (validar JWT do Google) | Backend | Medium | E1-3, E2-1 | 📌 |
| E2-3 | **Backend**: Modelo User + upsert por google_sub | Backend | Small | E1-6, E2-2 | 📌 |
| E2-4 | **Backend**: Emissão de JWT próprio (access + refresh tokens) | Backend | Medium | E2-3 | 📌 |
| E2-5 | **Backend**: Middleware de autenticação (@require_auth) | Backend | Small | E2-4 | 📌 |
| E2-6 | **Frontend**: Setup @react-oauth/google + Google button | Frontend | Small | E1-4, E2-1 | 📌 |
| E2-7 | **Frontend**: Chamar POST /auth/google, guardar JWT em localStorage | Frontend | Small | E2-6, E2-2 | 📌 |
| E2-8 | **Frontend**: Context/Hook para autenticação + redirecionar não-autenticados | Frontend | Small | E2-7 | 📌 |
| E2-9 | **Testes**: pytest para /auth/google + validação de JWT | Testes | Small | E2-4 | 🔵 |
| E2-10 | **Testes**: Vitest para componentes de login | Testes | Small | E2-8 | 🔵 |

**Bloqueadores**: E1 deve estar 100% pronto
**Entrada em Dev**: Semana 1, após E1
**Saída**: Usuário consegue fazer login e recebe JWT válido

### Epic E3: Mixer de Sons 🔊

**Objetivo**: Usuário controla volume independente de 6+ sons (páginas, chuva, relógio, sussurros, lareira, teclado).

#### Tasks:

| ID | Task | Tipo | Esforço | Deps | Status |
|----|------|------|---------|------|--------|
| E3-1 | Coletar/preparar arquivos de áudio (6 pistas) | Setup | Small | — | 📌 |
| E3-2 | **Backend**: Rota GET /sounds (listar sons com metadados) | Backend | Small | E1-3 | 📌 |
| E3-3 | **Frontend**: Componente Mixer com 6 sliders (volume 0-100) | Frontend | Medium | E1-4, E2-8 | 📌 |
| E3-4 | **Frontend**: Web Audio API para tocar sons em loop | Frontend | Medium | E3-3 | 📌 |
| E3-5 | **Frontend**: Sincronização de volumes (useEffect + estado local) | Frontend | Small | E3-4 | 📌 |
| E3-6 | **Frontend**: Efeito visual: waveform animada por som tocando | Frontend | Small | E3-5 | 🔵 |
| E3-7 | **Testes**: E2E com Playwright (abrir mixer, mudar volume) | Testes | Small | E3-5 | 🔵 |

**Bloqueadores**: E1 e E2 (autenticação necessária)
**Entrada em Dev**: Semana 2, paralelo a E2
**Saída**: Mixer visual funcional, sons trocam de volume em tempo real

### Epic E4: To-do & Presets 📝

**Objetivo**: Usuário gerencia sua to-do list e salva/carrega presets de som favoritos.

#### Tasks:

| ID | Task | Tipo | Esforço | Deps | Status |
|----|------|------|---------|------|--------|
| E4-1 | **Backend**: Modelo Task (title, completed, user_id, created_at) | Backend | Small | E1-6, E2-3 | 📌 |
| E4-2 | **Backend**: CRUD endpoints (GET /tasks, POST, PATCH, DELETE) | Backend | Medium | E4-1, E2-5 | 📌 |
| E4-3 | **Backend**: Modelo Preset (name, volumes JSON, user_id) | Backend | Small | E1-6, E2-3 | 📌 |
| E4-4 | **Backend**: CRUD endpoints para Presets | Backend | Medium | E4-3, E2-5 | 📌 |
| E4-5 | **Frontend**: Componente TodoList (adicionar, completar, deletar) | Frontend | Medium | E1-4, E2-8, E4-2 | 📌 |
| E4-6 | **Frontend**: Componente PresetManager (criar, load, delete presets) | Frontend | Medium | E3-5, E4-4 | 📌 |
| E4-7 | **Frontend**: Integrar PresetManager com Mixer (ao clickar preset, atualiza volumes) | Frontend | Small | E4-6, E3-5 | 📌 |
| E4-8 | **Testes**: pytest para CRUD de tasks + presets | Testes | Small | E4-2, E4-4 | 🔵 |
| E4-9 | **Testes**: Vitest para TodoList e PresetManager | Testes | Small | E4-5, E4-6 | 🔵 |
| E4-10 | **Frontend**: Persistence ao localStorage (as mudanças são salvas automaticamente) | Frontend | Small | E4-5, E4-6 | 🔵 |

**Bloqueadores**: E2 (autenticação)
**Entrada em Dev**: Semana 2-3, paralelo a E3
**Saída**: To-do list funcional, presets salvos e carregáveis

## 📊 FASE 2: Analytics & Produtividade (Semanas 5-7)

### Epic E5: Pomodoro & Analytics 📈

**Objetivo**: Timer de foco vinculado a tasks, histórico de sessões, dashboard com gráficos.

#### Tasks:

| ID | Task | Tipo | Esforço | Deps | Status |
|----|------|------|---------|------|--------|
| E5-1 | **Backend**: Modelo FocusSession (user_id, task_id, duration, started_at, ended_at) | Backend | Small | E1-6, E4-1 | 📌 |
| E5-2 | **Backend**: Endpoints para iniciar/pausar/finalizar sessão de foco | Backend | Medium | E5-1, E2-5 | 📌 |
| E5-3 | **Backend**: Rota GET /stats (minutos de foco por dia/semana) | Backend | Small | E5-1 | 📌 |
| E5-4 | **Frontend**: Componente PomodoroTimer (25min focus, 5min break) | Frontend | Medium | E1-4, E4-5 | 📌 |
| E5-5 | **Frontend**: Integrar timer com task selecionada (start/pause/stop) | Frontend | Medium | E5-4, E5-2, E4-5 | 📌 |
| E5-6 | **Frontend**: Componente Dashboard (gráfico de barras: minutos/dia, ultimas 7 dias) | Frontend | Medium | E5-3 | 📌 |
| E5-7 | **Frontend**: Renderizar gráfico com Recharts (responsivo) | Frontend | Small | E5-6 | 📌 |
| E5-8 | **Testes**: pytest para FocusSession CRUD + cálculo de stats | Testes | Small | E5-2, E5-3 | 🔵 |
| E5-9 | **Testes**: Vitest para PomodoroTimer e Dashboard | Testes | Small | E5-5, E5-7 | 🔵 |
| E5-10 | **Backend**: Job Celery para resumo semanal (via email/Telegram) | Backend | Medium | E5-3 | 📌 |
| E5-11 | **Backend**: Setup RabbitMQ + Celery + Celery Beat | Setup | Medium | E1-2 | 📌 |

**Bloqueadores**: Fase 1 (MVP) completa
**Entrada em Dev**: Semana 5
**Saída**: Dashboard funcional, resumo semanal automatizado

## 📊 FASE 3: Salas Compartilhadas (Semanas 8-10)

### Epic E6: Salas Compartilhadas 👥

**Objetivo**: Usuários entram em salas temáticas, veem em tempo real quantas pessoas estão estudando ali.

#### Tasks:

| ID | Task | Tipo | Esforço | Deps | Status |
|----|------|------|---------|------|--------|
| E6-1 | **Backend**: Modelo Room (name, theme, user_count_current) | Backend | Small | E1-6 | 📌 |
| E6-2 | **Backend**: Setup WebSocket em FastAPI | Setup | Medium | E1-3 | 📌 |
| E6-3 | **Backend**: Rota GET /rooms (listar salas disponíveis) | Backend | Small | E6-1, E2-5 | 📌 |
| E6-4 | **Backend**: Endpoint POST /rooms/{id}/join (user entra na sala) | Backend | Medium | E6-1, E2-5 | 📌 |
| E6-5 | **Backend**: WebSocket @socketio.on('join_room') — broadcast user_count para sala | Backend | Medium | E6-2, E6-4 | 📌 |
| E6-6 | **Backend**: Redis Pub/Sub para sincronizar user_count entre réplicas | Backend | Medium | E1-2, E6-5 | 📌 |
| E6-7 | **Frontend**: Componente RoomCard (nome, tema, user_count_current) | Frontend | Small | E1-4 | 📌 |
| E6-8 | **Frontend**: Componente RoomList (renderiza todas as salas) | Frontend | Medium | E6-3, E6-7 | 📌 |
| E6-9 | **Frontend**: WebSocket client (socket.io-client) | Frontend | Medium | E1-4 | 📌 |
| E6-10 | **Frontend**: Ao entrar em sala, se conecta ao WebSocket e recebe user_count em tempo real | Frontend | Medium | E6-9, E6-8 | 📌 |
| E6-11 | **Frontend**: Efeito visual de animação ao entrar/sair de sala | Frontend | Small | E6-10 | 🔵 |
| E6-12 | **Testes**: pytest para join_room logic | Testes | Small | E6-4, E6-5 | 🔵 |
| E6-13 | **Testes**: Vitest + E2E para WebSocket com Playwright | Testes | Medium | E6-10 | 🔵 |

**Bloqueadores**: Fase 1 completa + E5 (stats/analytics)
**Entrada em Dev**: Semana 8
**Saída**: Salas compartilhadas funcional, presença em tempo real

## 🔗 MATRIZ DE DEPENDÊNCIAS

```
FASE 1 (MVP)
│
├─ E1: Setup & Infra ✓ (bloqueador para tudo)
│  └─ E1-1 → E1-2 → E1-3, E1-4, E1-6
│     └─ E1-5 (paralelo a E1-3, E1-4)
│
├─ E2: Auth ✓ (bloqueador para E3, E4)
│  └─ E1 (setup) + E2-1 (Google Cloud)
│     └─ E2-2, E2-3, E2-4, E2-5 (sequential backend)
│     └─ E2-6, E2-7, E2-8 (sequential frontend)
│     └─ E2-9, E2-10 (parallel tests)
│
├─ E3: Mixer ✓ (independente, requer E1 + E2)
│  └─ E3-1 (coletar áudio)
│     └─ E3-2 (backend simples)
│     └─ E3-3, E3-4, E3-5 (frontend sequential)
│        └─ E3-6, E3-7 (polish + tests)
│
└─ E4: To-do & Presets ✓ (requer E1 + E2)
   └─ E4-1, E4-3 (DB models, paralelo)
      └─ E4-2, E4-4 (CRUD endpoints)
         └─ E4-5, E4-6 (UI components)
            └─ E4-7, E4-10 (integração)
               └─ E4-8, E4-9 (testes)

FASE 2 (Analytics)
│
└─ E5: Pomodoro & Analytics (requer FASE 1 completa)
   ├─ E5-11 (setup Celery/RabbitMQ, pode ser paralelo)
   ├─ E5-1, E5-2, E5-3 (backend sequential)
   │  └─ E5-8 (testes)
   └─ E5-4, E5-5 (frontend sequential)
      └─ E5-6, E5-7 (dashboard)
         └─ E5-9 (testes)
      └─ E5-10 (resumo semanal)

FASE 3 (Tempo Real)
│
└─ E6: Salas Compartilhadas (requer FASE 1 + E5)
   ├─ E6-2 (setup WebSocket)
   ├─ E6-1, E6-3 (models + endpoint simples)
   ├─ E6-4, E6-5 (join logic + broadcast)
   ├─ E6-6 (Redis sync, complexo)
   └─ E6-7, E6-8, E6-9, E6-10 (frontend)
      └─ E6-11, E6-12, E6-13 (polish + testes)
```

## 📅 TIMELINE ESTIMADA

| Semana | Foco Principal | Tasks Esperadas | Blockade? |
|--------|----------------|-----------------|-----------|
| **1** | Setup + Infra + Google OAuth | E1 (6 tasks) | ⏸️ Semana crítica |
| **2** | Auth (conclusão) + Mixer start | E2 (10 tasks) + E3 (3 tasks) | Progressão normal |
| **3** | Mixer (conclusão) + To-do start | E3 (4 tasks) + E4 (7 tasks) | Progressão normal |
| **4** | To-do + Presets (conclusão) | E4 (3 tasks) + testes | ✅ Fase 1 completa |
| **5** | Pomodoro + Dashboard start | E5 (7 tasks) + E5-11 setup | Progressão normal |
| **6** | Dashboard + Resumo semanal | E5 (4 tasks) | ✅ Fase 2 end-to-end |
| **7** | Testes, bugfixes, deploy Fase 1+2 | E5-9 + E5-8 + bugfixes | Deploy pronto |
| **8** | WebSocket setup + Salas backend | E6-2, E6-1 a E6-6 | Fase 3 start |
| **9** | Salas frontend + testes | E6-7 a E6-13 | Progressão normal |
| **10** | Deploy Fase 3 + refactor | Testes finais + polish | ✅ MVP completo |

## 🎯 PRIORIZAÇÃO RECOMENDADA (Kanban Board)

### Backlog Inicial (Pronto para Jira)

**Status: TODO (semanas 1-2)**
- E1-1, E1-2, E1-3, E1-4, E1-6 (todos P0)
- E2-1 (P0)

**Status: IN PROGRESS (após E1)**
- E1-5, E2-2, E2-3, E2-4, E2-5 (sequencial)

**Status: READY (aguardando E1)**
- E2-6, E2-7, E2-8 (frontend, paralelo a E2 backend)
- E3-1, E3-2, E3-3 (mixer, paralelo)

## 📝 CATEGORIAS DE TASKS (para Labels no Jira)

- 🔧 `setup` — Docker, CI/CD, infraestrutura
- 🔙 `backend` — FastAPI endpoints, DB, lógica
- 🎨 `frontend` — React components, UI, integração API
- 🧪 `test` — pytest, Vitest, E2E
- 🐛 `bugfix` — correção de bugs
- ✨ `enhancement` — melhorias, polish
- 📚 `documentation` — docs, README, comentários no código

## 🚀 SEQUÊNCIA RECOMENDADA PARA COMEÇAR

1. **Hoje (Semana 1, Dia 1-2)**
   - Criar repositório GitHub
   - Executar E1-1 (estrutura de pastas)
   - Executar E1-2 (Docker + docker-compose)

2. **Semana 1, Dia 3-5**
   - E1-3 (backend setup)
   - E1-4 (frontend setup)
   - E1-6 (schema banco)
   - E2-1 (Google Cloud Console)

3. **Semana 2**
   - E2-2 até E2-8 (Auth flow completo)
   - E3-1, E3-2, E3-3 (Mixer paralelo)

4. **Semana 3-4**
   - E3-4 até E3-7 (Mixer conclusão)
   - E4-1 até E4-10 (To-do + Presets)

5. **Semana 5+**
   - Fase 2 e Fase 3

## ✅ Pronto para o Jira?

Este planejamento está pronto para ser traduzido em **Epics + Stories + Tasks** no Jira. Cada linha da tabela vira um ticket com:
- **Summary**: descrição concisa
- **Epic**: E1, E2, E3, E4, E5 ou E6
- **Labels**: `setup`, `backend`, `frontend`, `test`
- **Priority**: P0 (E1, E2), P1 (E3, E4, E5), P2 (E6)
- **Linked Issues**: dependências explícitas
- **Story Points** (opcional): Small = 2-3, Medium = 5-8

**Próximos passos** (histórico, na época deste plano):
1. ✅ Você revisa e ajusta este planejamento
2. 🔗 Você conecta MCP do Jira
3. 📌 Eu crio todos os tickets automaticamente
4. 🚀 Você começa a trabalhar!

---

# Parte 2 — Backlog Consolidado para Jira (verasfocus) — versão reconciliada

**Fonte**: mescla do plano de implementação original (E1-E6, Parte 1 acima) com os tickets de design
(`FL-1` a `FL-14`, ver Parte 3 abaixo) recebidos do Claude Design.

**Estrutura**: 3 Epics por fase. Story Points em escala Fibonacci (1, 2, 3, 5, 8).

**Convenção de IDs neste documento** (referência interna, não precisa virar o ID real do
Jira — o Jira vai gerar KAN-1, KAN-2, etc. na ordem de criação):
- `BE-x` → ticket novo, de backend/infra, que foi adicionado para cobrir o que os tickets
  `FL-x` (focados em UI) não cobrem.
- `FE-x` → ticket novo, de scaffolding de frontend, que antecede o tema (FL-1).
- `FL-x` → ticket original do design (Parte 3, `TICKETS.md`), mantido com a mesma descrição e
  critérios de aceite, apenas renumerado/reagrupado por epic.

## 🎯 EPICS

| Epic | Nome | Objetivo | Prioridade |
|------|------|----------|-----------|
| **Epic A** | Fase 0-1 — Fundação & MVP | Ambiente, auth, mixer, tarefas e presets funcionando ponta a ponta | 🔴 P0 |
| **Epic B** | Fase 2 — Produtividade & Analytics | Pomodoro vinculado a tarefas, histórico, resumo semanal | 🟠 P1 |
| **Epic C** | Fase 3 — Salas Compartilhadas | Presença em tempo real em salas temáticas | 🟡 P2 |

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

## 🔗 Notas de reconciliação (o que mudou em relação ao plano original — Parte 1)

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

## 📝 RESUMO GERAL

| Epic | Tickets | Story Points |
|------|---------|---------------|
| Epic A — Fundação & MVP | 28 | ~99 |
| Epic B — Produtividade & Analytics | 10 | ~36 |
| Epic C — Salas Compartilhadas | 10 | ~39 |
| **Total** | **48** | **~174** |

## 🏷️ Labels (padronizadas)

`setup` · `backend` · `frontend` · `test` · `a11y` · `bugfix` · `enhancement` · `documentation`

## 📎 Anexos por ticket

Onde a coluna "Attach" tem um arquivo, anexe o PNG correspondente de `Design/screens/` ao
criar o ticket no Jira — ajuda muito quem for implementar.

## 🚀 Como isso vira tickets no Jira

**Opção 1 — MCP do Jira conectado**: assim que o conector "Atlassian" estiver
habilitado, os 3 Epics + 48 tickets podem ser criados automaticamente, já com
labels, story points e a descrição/critério de aceite de cada um, linkando as
dependências via "is blocked by"/"blocks".

**Opção 2 — Import CSV manual** (não depende de conector): um arquivo
`focus_library_jira_import.csv` pronto para o importador nativo do Jira
(Configurações do projeto → System → External System Import → CSV). Mapeie as
colunas na tela de import (Summary, Issue Type, Epic Name/Epic Link, Priority, Labels,
Story Points, Description) e ele cria tudo de uma vez.

---

# Parte 3 — Tickets de Design Detalhados (FL-1 a FL-14)

> Fonte original: `Design/TICKETS.md`. Ready to paste into Jira. Um epic, depois tickets
> agrupados por fase. Cada ticket nomeia o screenshot a anexar (em `Design/screens/`), os
> componentes MUI usados como base, e seus critérios de aceite. Estimativas são pontos
> relativos, não dias. Os tokens de design, medidas e strings de copy referenciados abaixo
> estão detalhados em `Documentation/DESIGN.md`.

## EPIC: Focus Library — virtual reading room

A focus app themed as a cozy classical library: ambient sound mixer, per-day notes, Pomodoro
timer, focus history, shared rooms. React + TypeScript + MUI v6, custom theme, day and night
modes. Design reference: this bundle.

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
