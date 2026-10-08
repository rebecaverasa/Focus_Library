## activate venv:

- cd backend
- powershell
  .\venv\Scripts\Activate.ps1

## run fast api with reload uvicorn:

- cd backend (not backend\app: app is imported as a package, e.g. `app.core.config`)
- with venv activated:
  uvicorn app.main:app --reload

## generate requirements.txt file:

- make shure venv is activated
- generate de file with pip freeze:
  pip freeze > requirements.txt

## wich python is active?

where python

## pip list:

pip list

## install requirements

pip freeze > requirements.txt

## lint + tests (same checks as CI)

- pip install -r requirements-dev.txt
- ruff check .
- ruff format --check .    (drop --check to auto-format)
- python -m pytest         (use `-m pytest`, not the bare `pytest` command —
  it's what puts backend/ on sys.path so `from app... import` resolves)

## integration tests (real Postgres)

tests/integration/ runs the services and routes against a real database. They are skipped
(with a message) unless TEST_DATABASE_URL is set; the database name must end in `_test`
and is created automatically, with the schema rebuilt from the models on each run. It never
touches the dev database.

- Linux/macOS/CI (db published on localhost):
  TEST_DATABASE_URL=postgresql://focus:change-me@localhost:5432/focus_library_test python -m pytest
- Windows host: asyncpg -> Docker Desktop port fails (see NOTE below), so run inside the
  compose network instead (URL-encode special characters in the password):
  docker run --rm --network docker_default -v "$(pwd -W):/work" -w /work     -e DATABASE_URL=postgresql://x:x@db/x -e REDIS_URL=redis://redis:6379/0     -e TEST_DATABASE_URL=postgresql://focus:<password>@db:5432/focus_library_test     --entrypoint sh docker-api -c "pip install -q pytest==8.3.4 httpx==0.28.1 && python -m pytest"
  (use MSYS_NO_PATHCONV=1 in Git Bash)

## alembic migrations

DATABASE_URL/REDIS_URL come from backend/.env (host) — copy backend/.env.example first.

- create a migration from model changes:
  alembic revision --autogenerate -m "message"
- apply pending migrations:
  alembic upgrade head
- check current DB revision:
  alembic current

NOTE (Windows): asyncpg's connection to a Postgres port published by Docker Desktop
gets reset on plain Windows (WinError 64/10054) even with the selector event loop —
this looks like a Docker Desktop/WSL2 port-forwarding quirk with asyncpg's handshake,
not something wrong in the code (container-to-container asyncpg works fine). Until
that's root-caused, run alembic commands through the api container instead, which also
keeps dev/CI/prod migrating the exact same way:

- docker compose -f docker/docker-compose.yml exec api alembic upgrade head
- docker compose -f docker/docker-compose.yml exec api alembic revision --autogenerate -m "message"

(alembic/ is bind-mounted into the api container, so generated migration files land
on the host and can be committed normally.)
