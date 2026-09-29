from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_teste_route_returns_hello_world():
    response = client.get("/teste")

    assert response.status_code == 200
    assert response.json() == {"message": "Hello world"}
