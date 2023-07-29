import os
import tempfile
from fastapi.testclient import TestClient

tempdir = tempfile.TemporaryDirectory()

out_file_path = os.path.join(tempdir.name, "test_app.db")
#os.environ["DATABASE_URL"] = "sqlite://"
os.environ["DATABASE_URL"] = "sqlite:///"+out_file_path
os.environ["TESTING"] = "True"
os.environ["FILE_STORAGE"]="Local"
os.environ["AWS_ACCESS_KEY_ID"]="foo"
os.environ["AWS_SECRET_ACCESS_KEY"]="foo"
os.environ["AWS_DEFAULT_REGION"]="us-east-1"
os.environ["AWS_S3_BUCKET"]="foo"


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
