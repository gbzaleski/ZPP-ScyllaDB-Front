import { Buffer } from 'buffer';

export const getOpcode = (buf : Buffer) : number => {
    // Opcode is at position 4 in the frame
    return buf[4]
}

export const getOpcodeName = (buf : Buffer) : string => {
    // Opcode is at position 4 in the frame
    var num = getOpcode(buf)

    switch (num) {
        case 0: {
            return "ERROR";
        }
        case 1: {
            return "STARTUP";
        }
        case 2: {
            return "READY";
        }
        case 3: {
            return "AUTHENTICATE";
        }
        case 5: {
            return "OPTIONS";
        }
        case 6: {
            return "SUPPORTED";
        }
        case 7: {
            return "QUERY";
        }
        case 8: {
            return "RESULT";
        }
        case 9: {
            return "PREPARE";
        }
        case 10: {
            return "EXECUTE";
        }
        case 11: {
            return "REGISTER";
        }
        case 12: {
            return "EVENT";
        }
        case 13: {
            return "BATCH";
        }
        case 14: {
            return "AUTH_CHALLENGE";
        }
        case 15: {
            return "AUTH_RESPONSE";
        }
        case 16: {
            return "AUTH_SUCCESS";
        }
    }
    return "INVALID";
}