#These are the SQLAlchemy models - defines interaction with DB

import sqlalchemy
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, UniqueConstraint

from .database import Base

metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, index=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True, nullable=False),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True, nullable=False),
    sqlalchemy.Column("password", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("upload", sqlalchemy.Boolean, nullable=False, default=False),

)

photo_cards = sqlalchemy.Table(
    "photo_cards",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, index=True),
    sqlalchemy.Column("front_file_name", sqlalchemy.String, unique=True),
    sqlalchemy.Column("back_file_name", sqlalchemy.String, unique=True),
    sqlalchemy.Column("group_name", sqlalchemy.String),
    sqlalchemy.Column("card_name", sqlalchemy.String),
    sqlalchemy.Column("share", sqlalchemy.Boolean, default=False),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, ForeignKey("users.id"), nullable=False)
)
    
favorites = sqlalchemy.Table(
    "favorites",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, index=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sqlalchemy.Column("photo_card_id", sqlalchemy.Integer, ForeignKey("photo_cards.id", ondelete="CASCADE"), nullable=False),
    UniqueConstraint("user_id", "photo_card_id", name="fav_uix_1"),
)

# class PhotoCard(Base):
#     __tablename__ = "photo_cards"

#     id = Column(Integer, primary_key=True, index=True)
#     front_file_name = Column(String, unique=True)
#     back_file_name = Column(String, unique=True)
#     group_name = Column(String)
#     member_name = Column(String)
#     is_private = Column(Boolean, default=True)

# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, nullable=False)
#     password = Column(String, nullable=False)

