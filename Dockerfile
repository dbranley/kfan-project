# Step 1: Build the React frontend
FROM node:18-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./frontend/package.json ./
RUN npm install
COPY ./frontend/vite.config.js ./
COPY ./frontend/index.html ./
COPY ./frontend/src ./src
RUN npm run build

# Step 2: Build the Python backend
FROM python:3.11
WORKDIR /app
RUN mkdir ./app
RUN mkdir ./app/images
COPY --from=build-step /app/dist ./app/dist

COPY ./requirements.txt ./
RUN pip install -r ./requirements.txt

COPY ./backend/app/.env ./
COPY ./backend/app/app/routers ./app/routers
COPY ./backend/app/app/sql_app ./app/sql_app
COPY ./backend/app/app/__init__.py ./app
COPY ./backend/app/app/main.py ./app
COPY ./backend/app/app/utils.py ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
