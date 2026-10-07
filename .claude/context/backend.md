# Contexto do Backend — Focus Library

Documento de contexto para quem implementa tickets de backend/infra (`BE-x`). Resume o que
está em `README.md`, `Documentation/ROADMAP.md`, `backend/commands.md` e no código.
**Fontes da verdade:** o código atual em `backend/` e `docker/`, depois o ROADMAP (Parte 2
para o backlog e dependências; Parte 1 para a descrição original E1–E6 de cada tarefa) e o
`README.md` (arquitetura, fluxo OAuth, stack). Para entender **o que a UI vai consumir**, veja
`Documentation/DESIGN.md` §"State" e §"Interações" e o arquivo `.claude/context/frontend.md`.

Se este arquivo divergir do código, **vale o código** (e atualize este arquivo).

---

## Arquitetura alvo (README §4)

```
[Frontend React/TS - Vercel]
        | REST + WebSocket
        v
[FastAPI]
   ├──> PostgreSQL  (users, tasks, sessions, presets, rooms)
   ├──> Redis       (cache + Pub/Sub de presença entre réplicas)
   └──> RabbitMQ    (broker)  <── Celery worker / Celery Beat (resumo semanal via Telegram)
```

## Stack atual (instalada)

| Peça | Versão / detalhe |
|---|---|
| Python | 3.12 (Docker e CI); venv local em `backend/venv` (o venv atual é 3.10 — cuidado com sintaxe só de 3.11+/3.12) |
| FastAPI | 0.141 · uvicorn 0.52 |
| ORM | SQLAlchemy 2.0 **async** + asyncpg |
| Migrations | Alembic 1.14 (env async, `sqlalchemy.url` vem do settings) |
| Config | pydantic-settings (`DATABASE_URL`, `REDIS_URL` do `.env`) |
| Testes | pytest 8 + httpx |
| Lint/format | ruff (line-length 100, regras `E`, `F`, `I`, target py312) |

**Previsto, ainda não instalado:** `google-auth` (BE-7), lib de JWT (ex.: `pyjwt` — BE-9),
`redis` client, Celery + RabbitMQ (BE-17), WebSocket (BE-24, nativo do FastAPI/Starlette).
Ao instalar: adicionar com versão fixa em `requirements.txt` (runtime) ou
`requirements-dev.txt` (dev/test).

## Estrutura e convenções do código

```
backend/
├── app/
│   ├── main.py            FastAPI app (hoje só GET /teste)
│   ├── core/config.py     Settings (pydantic-settings) + sqlalchemy_database_uri (troca para postgresql+asyncpg)
│   ├── db/
│   │   ├── base.py        Base(DeclarativeBase) com NAMING_CONVENTION (ix/uq/ck/fk/pk)
│   │   ├── mixins.py      UUIDPrimaryKeyMixin (gen_random_uuid() no Postgres) + TimestampMixin (created_at/updated_at timezone-aware)
│   │   └── session.py     engine async, AsyncSessionLocal, dependency get_db()
│   ├── api/routes/        (vazio) — routers por recurso
│   ├── models/            (vazio) — models SQLAlchemy
│   ├── schemas/           (vazio) — schemas Pydantic de entrada/saída
│   └── services/          (vazio) — regras de negócio
├── alembic/               env.py async; versions/ ainda sem migrations
├── tests/                 test_main.py, test_db_schema.py
├── commands.md            comandos do dia a dia (venv, uvicorn, ruff, pytest, alembic)
├── pyproject.toml         ruff + pytest (testpaths = tests)
├── Dockerfile             multi-stage, python:3.12-slim, uvicorn --reload
└── .env.example           URLs para rodar no host contra os containers
docker/
├── docker-compose.yml     db (postgres:16-alpine), redis (7-alpine), api (build ../backend, porta 8000)
└── .env.example           POSTGRES_USER/PASSWORD/DB; api recebe DATABASE_URL/REDIS_URL apontando para db/redis
```

Convenções de modelagem (BE-5):

- Todo model herda de `Base` + `UUIDPrimaryKeyMixin` + `TimestampMixin`, usando
  `Mapped[...]`/`mapped_column` (estilo SQLAlchemy 2.0).
- Constraints/índices ficam com nomes determinísticos pela `NAMING_CONVENTION` — não nomear à mão.
- **Todo módulo de model novo precisa ser importado onde o `alembic/env.py` enxerga**
  (ex.: `app/models/__init__.py` importando tudo, e esse pacote importado no `env.py`), senão o
  autogenerate não vê a tabela.
- Camadas: `routes` (HTTP, validação via `schemas`, `Depends(get_db)`) → `services` (regra) →
  `models`. Rotas async; sessão via `get_db()`.
- Comentários e docstrings do código em inglês, curtos, explicando o *porquê* (padrão atual).

## Como rodar e verificar

- Stack completa: `docker compose -f docker/docker-compose.yml up -d` (copiar
  `docker/.env.example` → `docker/.env`). API em `http://localhost:8000`, Swagger em `/docs`.
- Lint + testes (mesmo que o CI), dentro de `backend/`:
  `ruff check .` · `ruff format --check .` · `python -m pytest` (sempre `-m pytest`, para o
  `backend/` entrar no `sys.path`).
- Migrations: no Windows, asyncpg do host para o Postgres do Docker Desktop dá
  `WinError 64/10054` — **rode o Alembic dentro do container**:
  `docker compose -f docker/docker-compose.yml exec api alembic revision --autogenerate -m "..."`
  e `... exec api alembic upgrade head`. `alembic/` é bind-mount, então o arquivo gerado aparece
  no host para commitar. Revise sempre a migration gerada antes de commitar.
- CI (`.github/workflows/ci.yml`): job backend (Python 3.12, ruff check, ruff format --check,
  pytest) + build da imagem Docker.

## Domínio e contratos previstos

Fluxo de auth (README §3): frontend obtém o ID token do Google (`@react-oauth/google`) →
`POST /auth/google` → backend valida com `google-auth` (assinatura + audience = Client ID) →
upsert do usuário por `google_sub` → emite JWT próprio (access + refresh). Sem login por
e-mail/senha. Também existe a entrada "como convidado" no frontend (sessão em memória).

Dados que a UI precisa (DESIGN.md §"State"/"Fetching"):

- **User**: `google_sub` (único), email, nome, foto; preferência de modo `day|night` (hoje a UI
  guarda em localStorage).
- **Task (nota do dia)**: pertence a `(user, date)`; `text`, `done`, `mins` logados (e estimativa
  "25m estimate"). Endpoints: listar por data/intervalo, criar, atualizar, remover, e
  **contagem de notas por dia para um mês** (pontos do day picker).
- **Preset (cena)**: `name` + seis níveis 0–100 com ids fixos: pages, rain, clock, whispers,
  fire, keys. Seeds: Rainy Reading Room (rain 66 / pages 34 / clock 24), Fireside Night
  (fire 74 / rain 40 / pages 12), Quiet Stacks (keys 46 / whispers 38 / pages 20 / clock 16).
- **FocusSession**: task, duração, started/ended_at; foco padrão 25 / pausa 5. Completar a
  tarefa encerra a sessão e loga os minutos.
- **Stats**: totais diários de foco dos últimos 7 dias, total, média diária, nº de sessões,
  e tempo por cena.
- **Room**: 4 salas fixas (Silent Reading Room, Rain in the West Wing, Night Study, The Typing
  Table) com contagem de presença em tempo real (WebSocket + Redis Pub/Sub). Só contagem e
  avatares — nada de ranking/pontos.

## Tickets de backend (ROADMAP Parte 2)

| ID | O quê | Depende de |
|---|---|---|
| BE-1 ✅ | Estrutura do monorepo | — |
| BE-2 ✅ | Docker + compose (FastAPI + Postgres + Redis) | BE-1 |
| BE-3 ✅ | FastAPI + Alembic | BE-2 |
| BE-4 ✅ | CI GitHub Actions | BE-3, FE-1 |
| BE-5 ✅ | Convenções de schema + base de migrations | BE-2, BE-3 |
| BE-6 | Google Cloud Console: OAuth2 (Client ID, consent screen) — manual, da usuária | — |
| BE-7 | `POST /auth/google` (valida ID token do Google) | BE-3, BE-6 |
| BE-8 | Model `User` + upsert por `google_sub` | BE-5, BE-7 |
| BE-9 | JWT próprio (access + refresh) | BE-8 |
| BE-10 | Middleware/dependency de auth (`require_auth`) | BE-9 |
| BE-11 | pytest: `/auth/google` + validação de JWT | BE-10 |
| BE-12 | Model `Task` (por data, user_id, mins) | BE-5, BE-8 |
| BE-13 | CRUD `/tasks` (GET por data, POST, PATCH, DELETE) | BE-12, BE-10 |
| BE-14 | Model `Preset` (nome + 6 níveis) | BE-5, BE-8 |
| BE-15 | CRUD `/presets` | BE-14, BE-10 |
| BE-16 | pytest: CRUD tasks + presets | BE-13, BE-15 |
| BE-17 | RabbitMQ + Celery + Celery Beat | BE-2 |
| BE-18 | Model `FocusSession` | BE-5, BE-12 |
| BE-19 | Endpoints iniciar/pausar/finalizar sessão | BE-18, BE-10 |
| BE-20 | `GET /stats` (minutos por dia/semana) | BE-18 |
| BE-21 | pytest: FocusSession + stats | BE-19, BE-20 |
| BE-22 | Job Celery: resumo semanal via Telegram Bot API | BE-17, BE-20 |
| BE-23 | Model `Room` | BE-5 |
| BE-24 | WebSocket no FastAPI | BE-3 |
| BE-25 | `GET /rooms` | BE-23, BE-10 |
| BE-26 | `POST /rooms/{id}/join` | BE-23, BE-10 |
| BE-27 | WebSocket `join_room` — broadcast de contagem | BE-24, BE-26 |
| BE-28 | Redis Pub/Sub entre réplicas | BE-2, BE-27 |
| BE-29 | pytest: lógica de `join_room` | BE-26, BE-27 |

As descrições originais mais detalhadas estão na Parte 1 do ROADMAP (E2-x = auth, E4-x =
tasks/presets, E5-x = pomodoro/stats/celery, E6-x = salas).

## Decisões já tomadas (não refazer)

- `DATABASE_URL` usa `postgresql://` (funciona em qualquer cliente); o código converte para
  `postgresql+asyncpg://`.
- PK UUID gerada pelo Postgres (`gen_random_uuid()`), timestamps com timezone.
- `GET /sounds` foi removido do escopo: os sons são assets estáticos do frontend.
- Resumo semanal via **Telegram**, não e-mail.
