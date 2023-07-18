from fastapi import status, Response
from fastapi.testclient import TestClient
# from fastapi.responses JSONResponse
import asyncio
import pytest

from app.tests import utils

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

def test_create_user_valid_test1():
    print("test_create_user_valid_test1()")
    response = utils.create_user("testuser1", 
                                 "testuser1@email.com", 
                                 "testuser1password",
                                 client)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["username"] == "testuser1"
    assert data["email"] == "testuser1@email.com"
    assert "id" in data

def test_get_user_that_exists():
    print("test_get_user_that_exists()")
    #first create a user 
    response = utils.create_user("testuser2",
                                 "testuser2@email.com",
                                 "testuser2password",
                                 client)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "id" in data
    user_id = data["id"]
    #now get the user - should find it
    response = client.get("/api/user/"+str(user_id))
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["username"] == "testuser2"
    assert data["id"] == user_id
    assert data["email"] == "testuser2@email.com"

def test_get_user_that_does_not_exist():
    print("test_get_user_that_does_not_exist()")  
    #try to get a user that should not exist
    response = client.get("/api/user/999999999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found"
