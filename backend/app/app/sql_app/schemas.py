# these are the Pydantic models - I think this is for swagger

from pydantic import BaseModel

class PhotoCardBase(BaseModel):
    group_name: str # | None = None -what's this for? from example
    card_name: str
    share: bool
    source_type: str | None = None
    source_name: str | None = None

class PhotoCardCreate(PhotoCardBase):
    front_file_name: str 
    back_file_name: str
    user_id: int

class PhotoCard(PhotoCardBase):
    id: int
    front_file_name: str
    back_file_name: str
    owner_name: str
    favorite_id: int | None = None

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

class UserProfile(UserBase):
    public_card_count: int
    follower_count: int
    followee_count: int

class UserPwdUpdate(BaseModel):
    original_password: str
    new_password: str

    # class Config:
    #     orm_mode = True

class FavoriteBase(BaseModel):
    user_id: int
    photo_card_id: int

class Favorite(FavoriteBase):
    id: int

class FollowBase(BaseModel):
    follower: int
    followee: int

class Follow(FollowBase):
    id: int