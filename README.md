BACKEND - FastAPI:
To run the backend FastAPI project, use the following command from the /backend/app directory:
        uvicorn app.main:app --reload

To run the backend PyTest tests, use the following command from the /backend/app directory:
    pytest

Or to run a specific test only:
    pytest app/tests/routers/test_users.py

FRONTEND - Vite:
To run the frontend Vite project, use the following command from the /frontend directory:
    npm run dev

To run the backend Vitest tests, use the following command from the /frontend directory:
    npm run test

To run with silent-mode off (to get the console output), use the following:
    npm run test -- --silent=false


