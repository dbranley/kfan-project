# Step 1: Build the React frontend
FROM node:18-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./frontend-ts/package.json ./
COPY ./frontend-ts/tsconfig.json ./
COPY ./frontend-ts/tsconfig.node.json ./
RUN npm install
COPY ./frontend-ts/vite.config.ts ./
COPY ./frontend-ts/index.html ./
COPY ./frontend-ts/postcss.config.cjs ./
COPY ./frontend-ts/src ./src
COPY ./frontend-ts/public ./public
#HEALTHCHECK NONE
RUN npm run build

# Step 2: Build the Python backend
FROM python:3.11
WORKDIR /app
RUN mkdir ./app
RUN mkdir ./app/images
COPY --from=build-step /app/dist ./app/dist
RUN mkdir ./app/dist/public
COPY ./frontend-ts/public/logo-darkorange.svg ./app/dist/public

COPY ./requirements.txt ./
RUN pip install -r ./requirements.txt

#COPY ./backend/app/.env ./
COPY ./backend/app/alembic ./alembic
COPY ./backend/app/alembic.ini ./
COPY ./backend/app/app/routers ./app/routers
COPY ./backend/app/app/sql_app ./app/sql_app
COPY ./backend/app/app/__init__.py ./app
COPY ./backend/app/app/main.py ./app
COPY ./backend/app/app/utils.py ./app
COPY ./backend/app/scripts/docker-entrypoint.sh ./

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
CMD ["/bin/bash", "docker-entrypoint.sh"]
