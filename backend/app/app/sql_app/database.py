from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
import databases

SQLACHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

database = databases.Database(SQLACHEMY_DATABASE_URL)

engine = create_engine(
    SQLACHEMY_DATABASE_URL, connect_args={"check_same_thread":False}
)

Base = declarative_base()