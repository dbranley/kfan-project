# these are the Pydantic models - I think this is for swagger

from pydantic import BaseModel

class PhotoCardBase(BaseModel):
    group_name: str # | None = None -what's this for? from example
    card_name: str
    share: bool
    user_id: int

class PhotoCardCreate(PhotoCardBase):
    front_file_name: str 
    back_file_name: str

class PhotoCard(PhotoCardBase):
    id: int
    front_file_name: str
    back_file_name: str
    owner_name: str

    # class Config:
    #     orm_mode = True

class UserBase(BaseModel):
    username: str
    
class UserCreate(UserBase):
    email: str
    password: str 

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    email: str
    upload: bool

    # class Config:
    #     orm_mode = True

class FavoriteBase(BaseModel):
    user_id: int
    photo_card_id: int

class Favorite(FavoriteBase):
    id: int