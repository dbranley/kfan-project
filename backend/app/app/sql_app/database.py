from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import StaticPool
import databases

import os
from dotenv import load_dotenv

load_dotenv()

SQLACHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
#SQLACHEMY_DATABASE_URL = "sqlite:///./app/sql_app.db"

TESTING = os.getenv("TESTING", "False")

database = databases.Database(SQLACHEMY_DATABASE_URL)

if (TESTING == "False"):
    engine = create_engine(
        SQLACHEMY_DATABASE_URL, connect_args={"check_same_thread":False}
    )
else:
    engine = create_engine(
        SQLACHEMY_DATABASE_URL, connect_args={"check_same_thread":False}, poolclass=StaticPool
    )
    
# database = databases.Database(SQLACHEMY_DATABASE_URL)

Base = declarative_base()