from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import StaticPool
import databases

import os
from dotenv import load_dotenv

load_dotenv()

SQLACHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
#SQLACHEMY_DATABASE_URL = "sqlite:///./app/sql_app.db"
# print("database.py - SQLACHEMY_DATABASE_URL is:")
# print(SQLACHEMY_DATABASE_URL)

TESTING = os.getenv("TESTING", "False")
print("database - at top - TESTING is:")
print(TESTING)
SQLITE_FILE_BASED = os.getenv("SQLITE_FILE_BASED", "False")

if (TESTING == "False" and SQLITE_FILE_BASED == "False"):
    database = databases.Database(SQLACHEMY_DATABASE_URL, min_size=2, max_size=3)
    engine = create_engine(
        SQLACHEMY_DATABASE_URL #, connect_args={"check_same_thread":False} -->not valid for postgresql
    )
elif (TESTING == "False" and SQLITE_FILE_BASED == "True"):
    database = databases.Database(SQLACHEMY_DATABASE_URL)
    engine = create_engine(
        SQLACHEMY_DATABASE_URL 
    )
else:
    database = databases.Database(SQLACHEMY_DATABASE_URL, force_rollback=True)
    engine = create_engine(
        SQLACHEMY_DATABASE_URL, connect_args={"check_same_thread":False}, poolclass=StaticPool
    )
    

Base = declarative_base()