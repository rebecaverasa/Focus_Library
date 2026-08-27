# Focus Library

> Provisional name.

A virtual study library/room, with a classic/cozy library theme: ambient sound mixer
(pages turning, rain on the window, wall clock, background whispers, fireplace, laptop
keyboard) to accompany studying/working, daily tasks, focus timer (Pomodoro), session
history, and, in the future, shared study rooms with real-time presence.

**Project goal**: deepen fullstack knowledge (Python + TypeScript/React/Material UI)
through a complete personal project, using only free tools/services.

This project intends to use per-user data persistence, tasks, a productivity timer, and
real-time presence — which justifies a complete fullstack stack (backend, database,
messaging, real-time), as well as login with the user's Google account.

> Related documentation:
> - **[Documentation/DESIGN.md](Documentation/DESIGN.md)** — original design prompt, palette,
>   typography, screen-by-screen specification, interactions, state, and UI technical exceptions.
> - **[Documentation/ROADMAP.md](Documentation/ROADMAP.md)** — implementation plan, consolidated
>   backlog (Epics/tickets), and detailed design tickets, ready for Jira.
> - Design assets (screenshots, interactive `.dc.html` prototype) live in
>   `Documentation/Design/`.

---

## 1. Concept

A virtual study library/room, with a library theme: ambient sound mixer (pages turning,
rain on the window, wall clock, background whispers, fireplace, laptop keyboard) to
accompany studying/working. This project intends to use per-user data persistence, tasks,
a productivity timer, and real-time presence — which justifies a complete fullstack stack
(backend, database, messaging, real-time), as well as login with the user's Google account.

## 2. Features

**Phase 1 — MVP**:
- Library ambient sound mixer (independent volume per sound: pages, rain, clock,
  whispers, fireplace, etc.)
- Authentication: Google login (user data saved in the cloud, accessible from any
  device)
- Per-user persisted to-do list
- Presets: save your favorite volume combination

**Phase 2**:
- Pomodoro / focus timer linked to tasks
- Focus session history (dashboard with chart)
- Automatic weekly summary (email): completed tasks + focus minutes

**Phase 3** (optional, but valuable for portfolio):
- Shared study "rooms": users join a themed room (e.g. "Silent Reading Room",
  "Rain in the West Wing", "Night Study Room") and see in real time how many
  other people are studying there

## 3. Authentication — OAuth2 flow

Standard OAuth2 flow for SPA ("Sign in with Google"):

1. Frontend uses `@react-oauth/google` (Google Identity Services) to render the login button.
2. Upon authentication, Google returns an ID token (signed JWT, with email, name, photo, `sub` =
   unique user ID on Google).
3. Frontend sends that token to `POST /auth/google` on the backend.
4. Backend validates the token with the `google-auth` library (signature + audience = project's Client ID).
5. Backend upserts the user in Postgres (key: `google_sub`) and issues its own JWT
   (access + refresh) for subsequent calls.
6. Data (tasks, presets, sessions) is linked to `google_sub` in Postgres — that's why it
   works across any device.

**Setup**: Google Cloud Console → create project → configure OAuth consent screen →
create OAuth Client ID (Web application) → register authorized origins (`localhost:5173` in
dev, Vercel domain in production). No cost.

**Scope decision**: login only via Google, without traditional email/password — avoids building
password reset, email verification, hashing, etc., without losing the portfolio value of the
OAuth2 flow.

## 4. Architecture (overview)

```
[Frontend React/TS - Vercel]
        |
        | REST + WebSocket
        v
[FastAPI - k3s on Oracle Cloud]
    |         |
    |         +--> [Redis] (cache + Pub/Sub for WebSocket across replicas)
    |         +--> [RabbitMQ] (queue broker)
    |
    +--> [PostgreSQL] (users, tasks, sessions, presets)

[Celery Worker] <-- consumes queue --> [RabbitMQ]
[Celery Beat] --> schedules weekly job (productivity summary)
```

## 5. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend API | Python + FastAPI | REST + automatic docs (Swagger) |
| Authentication | Google OAuth2 + own JWT | `google-auth` (backend), `@react-oauth/google` (frontend) |
| Real-time | WebSocket (FastAPI) + Redis Pub/Sub | synchronizes presence across backend replicas |
| Queue / async tasks | Celery + RabbitMQ | session processing, weekly summary |
| Scheduling | Celery Beat | triggers periodic jobs |
| Relational database | PostgreSQL | persistent data |
| Cache | Redis | query cache + Pub/Sub broker |
| Frontend | React + TypeScript (Vite) | audio mixer, to-do list, dashboard |
| Charts | Recharts / Chart.js | focus history |
| Notifications | Telegram Bot API | weekly summary, simpler than SMTP |
| Backend tests | pytest + httpx | |
| Frontend tests | Vitest + Testing Library, Playwright (E2E) | |

## 6. DevOps

| Piece | Choice | Free? |
|---|---|---|
| Containerization | Docker + docker-compose (local dev) | yes |
| Orchestration | Kubernetes (k3s) running on Oracle Cloud Always Free ARM VMs | yes, permanently (alternative for learning without infra: kind/minikube local) |
| Image registry | GitHub Container Registry (ghcr.io) | yes |
| CI | GitHub Actions (lint, tests, image build) | yes |
| CD | GitHub Actions or ArgoCD (GitOps) applying to the cluster | yes |
| Frontend deploy | Vercel | yes, and it's the most widely used in the market for React/TS apps |
| Backend deploy (simple alternative before k8s) | Render free tier | yes |
| Observability — metrics | Prometheus + Grafana self-hosted on the cluster | yes |
| Observability — logs | Grafana Loki | yes |
| Observability — errors | Sentry (free tier) | yes |
| Observability — uptime | UptimeRobot | yes |

**Note on free Kubernetes**: there's no free-forever 24/7 managed K8s cluster on the
major clouds (GCP/AWS/Azure only give credits for a limited time). The practical path used
is to run k3s on Oracle Cloud Always Free VMs (permanent, no time limit). Alternative
for learning without worrying about infra: kind/minikube local.

## 7. Roadmap (high-level view)

1. **Local MVP**: FastAPI + Postgres + Google login + to-do list + frontend with sound mixer —
   all via docker-compose
2. **Messaging**: Celery + RabbitMQ for the weekly summary (simple async job)
3. **Real-time**: WebSocket + Redis Pub/Sub for shared rooms
4. **CI**: GitHub Actions running tests on every PR
5. **Initial deploy**: Vercel (frontend) + Render/Oracle (backend) — "live" version
6. **Kubernetes + CD + Observability**: migrate the backend to k3s, add
   Prometheus/Grafana/Sentry

> Full detail in epics/tickets, estimates, dependencies, and week-by-week timeline
> is in **[Documentation/ROADMAP.md](Documentation/ROADMAP.md)**.
