
export function validateEmail(email){

    const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;

    if (email === null || email.length === 0){
        return false;
    }
    
    if (email.search(regex) == 0){
        return true;
    } else {
        return false;
    }

}