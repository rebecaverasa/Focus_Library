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
