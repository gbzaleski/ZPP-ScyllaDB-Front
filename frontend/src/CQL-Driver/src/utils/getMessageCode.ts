const getMessageCode = (messageType: String) : number => {
    switch (messageType) {
        case "ERROR": {
            return 0;
        }
        case "STARTUP": {
            return 1;
        }
        case "READY": {
            return 2;
        }
        case "AUTHENTICATE": {
            return 3;
        }
        case "OPTIONS": {
            return 5;
        }
        case "SUPPORTED": {
            return 6;
        }
        case "QUERY": {
            return 7;
        }
        case "RESULT": {
            return 8;
        }
        case "PREPARE": {
            return 9;
        }
        case "EXECUTE": {
            return 10;
        }
        case "REGISTER": {
            return 11;
        }
        case "EVENT": {
            return 12;
        }
        case "BATCH": {
            return 13;
        }
        case "AUTH_CHALLENGE": {
            return 14;
        }
        case "AUTH_RESPONSE": {
            return 15;
        }
        case "AUTH_SUCCESS": {
            return 16;
        }
    }
    return -1;
}
export default getMessageCode;