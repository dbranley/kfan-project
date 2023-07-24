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

DOCKER:
To build docker image, use following command from the root project directory:
    docker build -t kfan-proj1 . 

To create and start a container from the new docker image, use the following command from the root project directory:
    docker run -d --name kfan1 -p 80:80 kfan-proj1
