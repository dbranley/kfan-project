from fastapi import status, Response
from fastapi.testclient import TestClient
# from fastapi.responses JSONResponse
import asyncio
import pytest

# from ...main import test_function
from app.main import app

client = TestClient(app)

def test_get_current_session_when_not_logged_in():
    print("test_users.test_get_current_session_when_not_logged_in()")
    response = client.get("/api/session")
    print("test_users.test_get_current_session_when_not_logged_in() - back from call to '/api/session'")
    print(response)
    print(response.json())
    response_dict = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert response_dict["username"] == "unknown"
    assert response_dict["id"] == 0
    assert response_dict["email"] == "unknown"

def test_whoami_when_not_logged_in():
    print("test_users.test_whoami_when_not_logged_in()")
    response = client.get("/api/whoami")
    print("test_users.test_whoami_when_not_logged_in() - back from call to '/api/session'")
    print(response)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
