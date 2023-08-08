from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from databases import Database 
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel

from app.sql_app import crud, schemas
from app.sql_app.database import database
from app.utils import validate_email

# use something like this to get the key:
# >openssl rand -hex 32
# SECRET_KEY = "a025898a78539f4f91208252c34b92a2754177bc3d23d6cd04b2e273bd535ad3"
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

#for logged out tokens -- need to put this into a DB or something...
BLOCKLIST = set()

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int | None = None

router = APIRouter()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    print("verify_password() - plain_password="+plain_password+"=, hashed_password="+hashed_password+"=")
    return pwd_context.verify(plain_password, hashed_password)


async def authenticate_user(username: str,
                      password: str,
                      database: Database):
    print("authenticate_user()")
    db_user = await crud.get_user_by_username(database, username)
    if db_user is None:
        print("authenticate_user() - db_user is NOT in DB")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password",
                            headers={"WWW-Authenticated":"Bearer"})

    if not verify_password(password, db_user.password):
        print("authenticate_user() - passwords not equal")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password",
                            headers={"WWW-Authenticated":"Bearer"})
    print("authenticate_user() - success - returning db_user:")
    print(db_user)
    return db_user


async def get_current_user(token: str, database: Database):
    print("users.get_current_user() - token is:")
    print(token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        # detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if token is None:
        print("users.get_current_user() - token is None, so 'raise' exception")
        raise credentials_exception
    
    if token in BLOCKLIST:
        print("get_current_user() - token in BLOCKLIST, so reject it")
        raise credentials_exception

    try:
        print("get_current_user() - about to call jwt.decode()")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("get_current_user() - just after calling jwt.decode()")
        user_id_str: str = payload.get("sub")
        user_id = int(user_id_str)
        print("get_current_user() - after decoding jwt and getting 'sub' from payload - user_id from payload is: ")
        print(user_id)
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        print("get_current_user() - in catch for JWTError - print that here: ")
        print(JWTError)
        raise # JWTError
        # raise credentials_exception
    
    user = await crud.get_user(database, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    
    # TODO
    # if user.disabled:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    print("get_current_user() - success - returning user: ")
    print(user)
    return user

#temporary hack to limit who can upload photos
def user_authorized_to_upload(user: schemas.User):
    print("users.user_authorized_to_upload() - user.upload given is:")
    print(user.upload)
    if (user.upload == True):
        return True
    else:
        return False


#endpoints for user management
# @database.transaction() - need commit/rollback control in the endpoint itself
@router.post("/api/register", tags=["users"], response_model=schemas.User)
async def register_user(user: schemas.UserCreate): #, db: Session = Depends(get_db)):
    #TODO - check to make sure username is unique

    #make sure email format is correct
    valid_format = validate_email(user.email)
    if (not valid_format):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address format is invalid")

    #hash the password
    pwd_hash = get_password_hash(user.password)
    user.password = pwd_hash

    transaction = await database.transaction()

    try:
        user = await crud.create_user(database, user)
        print("register() - after create")
        # print("register() - after create but will force an exception so there is a rollback")
        # raise Exception("force exception here!!")
    except Exception as ex:
        print("register_user() - in the except block - printing exception here: ")
        print(ex)
        await transaction.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while creating user - error is - " + str(ex))
    else:
        print("register_user() - in 'else' so about to commit")
        await transaction.commit()

    return user

@database.transaction()
@router.get("/api/user/{user_id}", tags=["users"], response_model=schemas.User)
async def read_user(user_id: int):
    print("main.read_user() - about to call crud.get_user()")
    db_user = await crud.get_user(database, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@database.transaction()
@router.post("/api/login", tags=["users"])
async def login(user: schemas.UserLogin):
    print("login()")

    db_user = await authenticate_user(user.username, user.password, database)
    print("login() - back from 'authenticate_user() - resp db_user is:")
    print(db_user)
    if db_user is None:
        print("login() - failed")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password",
                            headers={"WWW-Authenticated":"Bearer"})

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub":str(db_user.id)}, expires_delta=access_token_expires
    )
    #cookie expiration needs to be in seconds, not minutes
    cookie_expires = ACCESS_TOKEN_EXPIRE_MINUTES * 60
    content = {"message":"Login successful"}
    response = JSONResponse(content=content, status_code=status.HTTP_200_OK)
    # response.set_cookie(key="token", value=access_token, expires=cookie_expires, secure=False, samesite='lax')
    response.set_cookie(key="token", value=access_token, httponly=True, expires=cookie_expires, secure=False, samesite='lax')
    return response

@database.transaction()
@router.post("/api/logout", tags=["users"])
def logout(request: Request):
    token = request.cookies.get("token")
    print("logout()")
    
    if token is None:
        print("logout() - token is 'None'")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Not logged in",
                            headers={"WWW-Authenticated":"Bearer"})
    print("logout() - token is not 'None' - so will continue trying to logout")
    BLOCKLIST.add(token)
       
    content = {"message":"Logout successful"}
    response = JSONResponse(content=content, status_code=status.HTTP_200_OK)
    response.set_cookie(key="token", value="", httponly=True, samesite="strict", expires=-1)

    return response

@database.transaction()
@router.get("/api/whoami", tags=["users"])
async def read_current_user(request: Request) -> schemas.User:
    print("read_current_user() - whoami")
    token = request.cookies.get("token")
    user = await get_current_user(token, database)
    return user

@database.transaction()
@router.get("/api/session", tags=["users"])
async def read_current_session(request: Request) -> schemas.User:
    print("read_current_session() - at top")
    token = request.cookies.get("token")

    #unknown user - return this if session cannot be verified
    user = {
        'id': 0, 
        'username': 'unknown',
        'email': 'unknown',
        'upload': False,
    }
    try:
        user = await get_current_user(token, database)
    except HTTPException as error:
        print("read_current_session() - in 'except HTTPException' - error is:")
        print(error)
        print("read_current_session() - in 'except HTTPException' - error.status_code is:")
        print(error.status_code)
        if (error.status_code == status.HTTP_401_UNAUTHORIZED):
            pass
        else:
            raise
    except JWTError:
        print("read_current_session() - got JWTError, so just pass to return unknown user")
        pass

    print("read_current_session() - at end - returning user:")
    print(user)
    return user