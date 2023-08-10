from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

import os
from dotenv import load_dotenv

from app.sql_app import models
from app.sql_app.database import engine, database

from app.routers import users, photo_cards, favorites

load_dotenv()

#Create the local DB if this is a testing run - otherwise, managed by Alembic
TESTING = os.getenv("TESTING", "False")
SQLITE_FILE_BASED = os.getenv("SQLITE_FILE_BASED", "False")
if (TESTING == "True" or SQLITE_FILE_BASED == "True"): 
    print("main - TESTING is True or SQLITE_FILE_BASED is True, so create the DB")
    models.metadata.create_all(bind=engine)
else:
    print("main - TESTING is False, so do not create DB")

app = FastAPI()

app.include_router(users.router)
app.include_router(photo_cards.router)
app.include_router(favorites.router)

# Uncomment this when I want to deploy React app from the Python app - build server will go at /dist...
#
if (os.path.exists("app/dist/assets")):
    print("main - the 'app/dist/assets' dir exists, so go ahead and mount it for UI assets")
    app.mount('/assets', StaticFiles(directory="app/dist/assets"), 'assets')
    app.mount('/public', StaticFiles(directory="app/dist/public"), 'public')
    # app.mount('/', StaticFiles(directory="app/dist"), '')
    # app.mount('/dist', StaticFiles(directory="app/dist"), 'dist')

# Uncomment this when I want to deploy React app from the Python app - build server will go at /dist...
#
@app.get("/", response_class=HTMLResponse)
async def react_app():
    return open("app/dist/index.html","r").read()

#startup/shutdown events
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

def test_function():
    pass