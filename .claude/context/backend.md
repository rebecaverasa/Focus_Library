# Contexto do Backend — Focus Library

Documento de contexto para quem implementa tickets de backend/infra (`BE-x`). Resume o que
está em `README.md`, `Documentation/ROADMAP.md`, `backend/commands.md` e no código.
**Fontes da verdade:** o código atual em `backend/` e `docker/`, depois o ROADMAP (Parte 2
para o backlog e dependências; Parte 1 para a descrição original E1–E6 de cada tarefa) e o
`Documentation/ARCHITECTURE.md` (identidade/auth, arquitetura, stack). Para entender **o que a UI vai consumir**, veja
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
| Config | pydantic-settings (`DATABASE_URL`, `REDIS_URL`, `CORS_ORIGINS` do `.env`) |
| Testes | pytest 8 + httpx |
| Lint/format | ruff (line-length 100, regras `E`, `F`, `I`, target py312) |

**Previsto, ainda não instalado:** `google-auth` e lib de JWT (ex.: `pyjwt`) só na Epic D,
`redis` client, Celery + RabbitMQ (BE-17), WebSocket (BE-24, nativo do FastAPI/Starlette).
Ao instalar: adicionar com versão fixa em `requirements.txt` (runtime) ou
`requirements-dev.txt` (dev/test).

## Estrutura e convenções do código

```
backend/
├── app/
│   ├── main.py            FastAPI app: CORSMiddleware (libera X-Client-Id), routers, GET /teste
│   ├── core/config.py     Settings (pydantic-settings) + sqlalchemy_database_uri (troca para postgresql+asyncpg) + cors_origin_list
│   ├── db/
│   │   ├── base.py        Base(DeclarativeBase) com NAMING_CONVENTION (ix/uq/ck/fk/pk)
│   │   ├── mixins.py      UUIDPrimaryKeyMixin (gen_random_uuid() no Postgres) + TimestampMixin (created_at/updated_at timezone-aware)
│   │   └── session.py     engine async, AsyncSessionLocal, dependency get_db()
│   ├── api/deps.py        get_client / CurrentClient (X-Client-Id → upsert do Client)
│   ├── api/routes/        routers por recurso (clients.py: GET /clients/me)
│   ├── models/            models SQLAlchemy; __init__.py importa todos (client.py: Client, task.py: Task)
│   ├── schemas/           schemas Pydantic de entrada/saída (client.py: ClientRead, task.py: TaskRead)
│   └── services/          regras de negócio (clients.py: upsert_client com ON CONFLICT)
├── alembic/               env.py async (importa app.models); versions/: 0f53c8e00b90 clients, 276a2b91c20b tasks
├── tests/                 conftest.py (env fake p/ CI sem .env), test_main, test_db_schema, test_clients
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

**Identidade na v1 — sem login** (decidido em outubro/2026; ROADMAP Parte 2 "Mudança de
escopo" e `Documentation/ARCHITECTURE.md` §1.1):

- O frontend gera um UUID por navegador (localStorage) e manda em toda chamada no header
  **`X-Client-Id`** (FE-3).
- O backend (BE-30) tem um model `Client` (PK = esse UUID) e uma dependency `get_client`
  que valida o header (UUID válido, senão 400), faz upsert do `Client` e o injeta nas rotas.
  Tasks, presets e focus sessions têm `client_id` (FK para `Client`).
- **Uso (BE-30 pronto):** nas rotas, `client: CurrentClient` (de `app.api.deps`) — já valida
  o header (400 se faltar/for inválido) e faz o upsert (`INSERT ... ON CONFLICT (id) DO UPDATE
  SET last_seen_at = now()`). FKs novas apontam para `clients.id`. `GET /clients/me` devolve
  `{id, created_at, last_seen_at}`. CORS libera `X-Client-Id` para as origens de `CORS_ORIGINS`.
- Toda query filtra pelo `client_id` do header — nunca devolver dados de outro ID. O ID
  identifica, mas não autentica; não guardar dado pessoal na v1.

**Depois (Epic D)**: login com Google opcional — ID token do Google → `POST /auth/google` →
valida com `google-auth` (assinatura + audience = Client ID) → upsert de `User` por
`google_sub` → JWT próprio (access + refresh); no primeiro login, os dados do `client_id`
passam para o usuário (BE-31). Sem login por e-mail/senha.

Dados que a UI precisa (DESIGN.md §"State"/"Fetching"):

- **Client** (v1): só o UUID do navegador + timestamps. (`User` com `google_sub`, email,
  nome e foto só na Epic D.) A preferência de modo `day|night` fica no localStorage.
- **Task (nota do dia)**: pertence a `(client, date)`; `text`, `done`, `mins` logados (e estimativa
  "25m estimate"). Endpoints: listar por data/intervalo, criar, atualizar, remover, e
  **contagem de notas por dia para um mês** (pontos do day picker).
  **Model pronto (BE-12):** tabela `tasks` = `client_id` (FK `clients.id`, CASCADE), `title`
  (String 200), `date` (Date, dia da nota), `done` (bool, default false), `mins` (int, default 0,
  CHECK `mins >= 0`) + id/timestamps. Índice composto `ix_tasks_client_id_date (client_id, date)`.
  Sem coluna de ordem (lista ordena por `created_at`), sem `completed_at` e sem "ativa" (é estado
  do timer no cliente) nem estimativa (derivada da duração padrão). `TaskRead` não expõe `client_id`.
  Create/Update schemas ficam para o BE-13.
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
| BE-30 ✅ | Identificação anônima: header `X-Client-Id`, model `Client`, dependency `get_client` | BE-5 |
| BE-12 ✅ | Model `Task` (por data, client_id, mins) | BE-5, BE-30 |
| BE-13 | CRUD `/tasks` (GET por data, POST, PATCH, DELETE) | BE-12, BE-30 |
| BE-14 | Model `Preset` (nome + 6 níveis, por client_id) | BE-5, BE-30 |
| BE-15 | CRUD `/presets` | BE-14, BE-30 |
| BE-16 | pytest: CRUD tasks + presets | BE-13, BE-15 |
| BE-17 | RabbitMQ + Celery + Celery Beat | BE-2 |
| BE-18 | Model `FocusSession` | BE-5, BE-12 |
| BE-19 | Endpoints iniciar/pausar/finalizar sessão | BE-18, BE-30 |
| BE-20 | `GET /stats` (minutos por dia/semana) | BE-18 |
| BE-21 | pytest: FocusSession + stats | BE-19, BE-20 |
| BE-22 | Job Celery: resumo semanal via Telegram Bot API | BE-17, BE-20 |
| BE-23 | Model `Room` | BE-5 |
| BE-24 | WebSocket no FastAPI | BE-3 |
| BE-25 | `GET /rooms` | BE-23 |
| BE-26 | `POST /rooms/{id}/join` | BE-23, BE-30 |
| BE-27 | WebSocket `join_room` — broadcast de contagem | BE-24, BE-26 |
| BE-28 | Redis Pub/Sub entre réplicas | BE-2, BE-27 |
| BE-29 | pytest: lógica de `join_room` | BE-26, BE-27 |
| **Epic D (fora da v1)** | | |
| BE-6 | Google Cloud Console: OAuth2 (Client ID, consent screen) — manual, da usuária | — |
| BE-7 | `POST /auth/google` (valida ID token do Google) | BE-3, BE-6 |
| BE-8 | Model `User` + upsert por `google_sub` | BE-5, BE-7 |
| BE-9 | JWT próprio (access + refresh) | BE-8 |
| BE-10 | Middleware/dependency de auth (`require_auth`) | BE-9 |
| BE-31 | Vincular dados do `client_id` à conta no primeiro login | BE-10, BE-30 |
| BE-11 | pytest: `/auth/google` + validação de JWT | BE-10 |

As descrições originais mais detalhadas estão na Parte 1 do ROADMAP (E2-x = auth, E4-x =
tasks/presets, E5-x = pomodoro/stats/celery, E6-x = salas).

## Decisões já tomadas (não refazer)

- Testes não usam banco: `tests/conftest.py` define `DATABASE_URL`/`REDIS_URL` fake (o CI não
  tem `.env`) e os testes de rota sobrescrevem `get_db` e trocam o service por fake em memória.
- Pacotes de `app/` são namespace packages (sem `__init__.py`), exceto `app/models`.

- `DATABASE_URL` usa `postgresql://` (funciona em qualquer cliente); o código converte para
  `postgresql+asyncpg://`.
- PK UUID gerada pelo Postgres (`gen_random_uuid()`), timestamps com timezone.
- `GET /sounds` foi removido do escopo: os sons são assets estáticos do frontend.
- Resumo semanal via **Telegram**, não e-mail.
