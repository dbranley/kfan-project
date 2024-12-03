#Script to reset a user's password
import sys, getopt
import os

from dotenv import load_dotenv
from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.sql import text
from sqlalchemy import create_engine

def reset_user_pwd(user_id: int, user_name: str, new_password: str):
    print("reset_user.reset_user_pwd() - at top of function")

    load_dotenv()
    SQLACHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
    
    #validate arguments
    if user_id <= 0:
        print("Invalid <user_id>, must be numeric value greater than 0")
        print('reset_user.py -i <user_id> -n <user_name> -p <new_password>')
        sys.exit()
    if len(user_name) == 0:
        print("Invalid <user_name>")
        print('reset_user.py -i <user_id> -n <user_name> -p <new_password>')
        sys.exit()
    if len(new_password) == 0:
        print("Invalid <new_password>")
        print('reset_user.py -i <user_id> -n <user_name> -p <new_password>')
        sys.exit()
    
    try:
        #establish connection to the database
        engine = create_engine(SQLACHEMY_DATABASE_URL, echo=False)
        conn = engine.connect()

        #hash the password
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        new_password_hash = pwd_context.hash(new_password)
        
        #now update the password for the user
        statement = text("""UPDATE users SET password = :new_pwd WHERE id = :id """)
        result = conn.execute(statement, {"new_pwd": new_password_hash, "id": user_id})

        print("reset_user.reset_user_pwd() - after update execute - result is:")
        print(result)

    except HTTPException as httpex:
        print("reset_user.reset_user_pwd() - in the except 'HTTPException' block - printing exception here: ")
        print(httpex)

        #now rethrow this
        raise httpex
    
    except Exception as ex:
        print("reset_user.reset_user_pwd() - in the except 'Exception' block - printing exception here: ")
        print(ex)

        #this duplicates same code above so should do something about that
        conn.rollback()

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Exception thrown while updating the user - error is - " + str(ex))
    else:
        print("reset_user.reset_user_pwd() - in 'else' so about to commit")
        conn.close()
    
    return


    

if __name__ == "__main__":
    opts, args = getopt.getopt(sys.argv[1:], "hi:n:p:")

    user_id = 0
    user_name = ''
    new_password = ''
    for opt, arg in opts:
        if opt == '-h':
            print('reset_user.py -i <user_id> -n <user_name> -p <new_password>')
            sys.exit()
        if opt == '-i':
            if arg.isnumeric() == False:
                print('Invalid argument - <user_id> must be numeric')
                print('reset_user.py -i <user_id> -n <user_name> -p <new_password>')
                sys.exit()
            user_id = int(arg)
        if opt == '-n':
            user_name = arg
        if opt == '-p':
            new_password = arg
    print("After getting args: user_id=" +str(user_id)+"=, user_name="+user_name+"=")

    reset_user_pwd(user_id, user_name, new_password)
