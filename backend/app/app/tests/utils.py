import os
import tempfile
from fastapi.testclient import TestClient

tempdir = tempfile.TemporaryDirectory()

out_file_path = os.path.join(tempdir.name, "test_app.db")
#os.environ["DATABASE_URL"] = "sqlite://"
os.environ["DATABASE_URL"] = "sqlite:///"+out_file_path
os.environ["TESTING"] = "True"
os.environ["FILE_STORAGE"]="Local"
os.environ["IMAGE_MAX_SIZE_MB"] = "0.2"
os.environ["AWS_ACCESS_KEY_ID"]="foo"
os.environ["AWS_SECRET_ACCESS_KEY"]="foo"
os.environ["AWS_DEFAULT_REGION"]="us-east-1"
os.environ["AWS_S3_BUCKET"]="foo"
os.environ["JWT_SECRET_KEY"]="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
os.environ["JWT_ALGORITHM"]="HS256"
os.environ["JWT_EXPIRE_MINUTES"]="15"


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
