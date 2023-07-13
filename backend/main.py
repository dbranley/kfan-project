from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

from sql_app import models
from sql_app.database import engine, database

from routers import users, photo_cards

models.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router)
app.include_router(photo_cards.router)

# Uncomment this when I want to deploy React app from the Python app - build server will go at /dist...
#
app.mount('/assets', StaticFiles(directory="dist/assets"), 'assets')

# Uncomment this when I want to deploy React app from the Python app - build server will go at /dist...
#
@app.get("/", response_class=HTMLResponse)
async def react_app():
    return open("dist/index.html","r").read()

#startup/shutdown events
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
