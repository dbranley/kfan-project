To run the backend FastAPI project, use the following command from the /backend/app directory:

uvicorn app.main:app --reload

To run the frontend Vite project, use the following command from the /frontend directory:

npm run dev


To run the backend PyTest tests, use the following command from the /backend/app directory:
pytest

Or to run a specific test only:
pytest app/tests/routers/test_users.py