import os
import tempfile
from fastapi.testclient import TestClient

tempdir = tempfile.TemporaryDirectory()

out_file_path = os.path.join(tempdir.name, "test_app.db")
#os.environ["DATABASE_URL"] = "sqlite://"
os.environ["DATABASE_URL"] = "sqlite:///"+out_file_path
os.environ["TESTING"] = "True"


def create_user(username: str, email: str, password: str, client: TestClient):
    print("utils.create_user() username="+username+
          ", email="+email+", password="+password+"=")
    response = client.post(
        "/api/register",
        json={
            "username": username,
            "email": email,
            "password":password
        })
    return response
