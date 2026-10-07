from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import CLIENT_ID_HEADER
from app.api.routes import clients, tasks
from app.core.config import settings

app = FastAPI()

# X-Client-Id is a custom header, so browsers preflight every call; it has to be listed
# explicitly or the frontend's requests get blocked before reaching the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", CLIENT_ID_HEADER],
)

app.include_router(clients.router)
app.include_router(tasks.router)


@app.get("/teste")
async def root():
    return {"message": "Hello world"}
