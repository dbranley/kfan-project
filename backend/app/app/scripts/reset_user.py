#Script to reset a user's password
import sys, getopt
import os
from dotenv import load_dotenv


def reset_user_pwd(user_id: int, user_name: str, new_password: str):
    print("reset_user_pwd() - here I am ")

    load_dotenv()
    
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
    print("After getting args: user_id=" +str(user_id)+"=, user_name="+user_name+"=, new_password="+new_password+"=")
    reset_user_pwd(user_id, user_name, new_password)