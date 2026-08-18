# Focus Library — Plano de Implementação (Kanban)

**Data**: Agosto 2026  
**Projeto**: Focus Library (Biblioteca Virtual de Estudos)  
**Stack**: Python + FastAPI | React + TypeScript | PostgreSQL | Redis | RabbitMQ | Celery

---

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

---

## 🎯 EPICS (Agrupamentos principais)

| Epic | Descrição | Fase | Prioridade |
|------|-----------|------|-----------|
| **E1: Setup & Infra** | Ambiente dev local, Docker, estrutura inicial | 1 | 🔴 P0 |
| **E2: Autenticação OAuth2** | Login Google, JWT, persistência de usuário | 1 | 🔴 P0 |
| **E3: Mixer de Sons** | Backend + Frontend do mixer de áudio | 1 | 🔴 P0 |
| **E4: To-do & Presets** | CRUD de tasks, sistema de presets de som | 1 | 🟠 P1 |
| **E5: Pomodoro & Analytics** | Timer de foco, histórico, dashboard | 2 | 🟠 P1 |
| **E6: Salas Compartilhadas** | WebSocket, Redis Pub/Sub, presença real-time | 3 | 🟡 P2 |

---

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

---

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

---

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

---

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

---

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

---

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

---

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

---

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

---

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

---

## 📝 CATEGORIAS DE TASKS (para Labels no Jira)

- 🔧 `setup` — Docker, CI/CD, infraestrutura
- 🔙 `backend` — FastAPI endpoints, DB, lógica
- 🎨 `frontend` — React components, UI, integração API
- 🧪 `test` — pytest, Vitest, E2E
- 🐛 `bugfix` — correção de bugs
- ✨ `enhancement` — melhorias, polish
- 📚 `documentation` — docs, README, comentários no código

---

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

---

## ✅ Pronto para o Jira?

Este planejamento está pronto para ser traduzido em **Epics + Stories + Tasks** no Jira. Cada linha da tabela vira um ticket com:
- **Summary**: descrição concisa
- **Epic**: E1, E2, E3, E4, E5 ou E6
- **Labels**: `setup`, `backend`, `frontend`, `test`
- **Priority**: P0 (E1, E2), P1 (E3, E4, E5), P2 (E6)
- **Linked Issues**: dependências explícitas
- **Story Points** (opcional): Small = 2-3, Medium = 5-8

---

**Próximos passos**: 
1. ✅ Você revisa e ajusta este planejamento
2. 🔗 Você conecta MCP do Jira
3. 📌 Eu crio todos os tickets automaticamente
4. 🚀 Você começa a trabalhar!

Dúvidas ou ajustes no plano?
