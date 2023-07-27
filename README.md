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
To build docker image, use following command from the root project directory - before /frontend and /backend:

    docker build -t kfan-proj1 . 

To build docker image without using any cached content, used this from the root project directory:

    docker build --no-cache -t kfan-proj1 .

To create and start a container from the new docker image, use the following command from the root project directory:

    docker run -d --name kfan1 -p 80:80 kfan-proj1

To create and start a container with an environment varialb file, use the following command from the root project directory:

    docker run --env-file docker-variables.env -d --name kfan1 -p 80:80 kfan-proj1

Alembic:
Had problems getting alembic properly installed with pip. When I ran 'pip install -r requirements.txt' from command
line after activating venv, it did not work right. Install seemed to go fine, but when I ran 'alembic --version' from
command line it was not the one I installed. It was an old version from somewhere on the Mac.

To get around this, I 'sort of' followed instructions on the Alembic website docs:
https://alembic.sqlalchemy.org/en/latest/front.html#installation

First, I 'deactivated' the virtual environment, then I did the pip install like this:

    .venv/bin/pip install alembic

Then I activated the virtual environment and then when I checked the version it was the right one.

To autogenerate alembic DB migration stuff, us the following command from the backend/app directory:

    alembic revision --autogenerate -m "comment here"

To run the alembic ugprade, use the following command from the backend/app directory:

    alembic upgrade head

[![GitHub Super-Linter](https://github.com/dbranley/kfan-project/actions/workflows/super-linter.yml/badge.svg)](https://github.com/marketplace/actions/super-linter)
