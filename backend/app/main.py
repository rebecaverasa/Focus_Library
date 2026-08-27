from fastapi import FastAPI

app = FastAPI()

@app.get("/teste")
async def root():
    return {"message": "Hello world"}