import { getConstantValue } from "typescript";
import getConsistency from "../functions/Consistency";
import { bufferToInt, bufferToShort, bufferToShortBytes, bufferToString } from "./conversions";
const format = require("biguint-format");

const getServerErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Server Error"]
}

const getProtocolErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Protocol Error"]
}

const getAuthenticationErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Autentication Error"]
}


const getUnavialableExceptionMessage = (errorBody: Buffer): [string, string] => {
    const consistency = bufferToShort(errorBody).short
    const required = bufferToInt(errorBody.slice(2)).int
    const alive = bufferToInt(errorBody.slice(6)).int

    const message = 
        "Consistency of query that triggered exception: " +
        format(consistency) + ". " + 
        "Required nodes alive: " +
        format(required) + ", " + 
        "Current nodes alive: " +
        format(alive) + "."

    return [message  , "Unavailable"]
}

const getOverloadedMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Overloaded"]
}

const getIsBootstrappingMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Is Bootstrapping"]
}

const getTruncateErrorMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Truncate Error"]
}

const getSyntaxErrorMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Syntax Error"]
}

const getUnautorizedMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Unauthorized"]
}

const getInvalidMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Invalid"]
}

const getConfigErrorMessage = (errorBody: Buffer): [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Config Error"]
}

const getAlreadyExistsMessage = (errorBody: Buffer): [string, string] => {
    const keyspace = bufferToString(errorBody).string
    const table = bufferToString(errorBody.slice(keyspace.length)).string

    const message = table.length == 0 ? 
        "Keyspace " + keyspace.toString() + " already exists." :
        "Table " + keyspace.toString() + "/" + table.toString() + "already exists."

    throw [message, "Already Exists"];
}

const getUnpreparedMessage = (errorBody: Buffer): [string, string] => {
    const id = BigInt(format(bufferToShortBytes(errorBody).shortBytes))
    const message = 
        "Prepared statement of ID: " + id.toString() + " does not exist."
    return [message, "Unprepared"]
}



const extractErrorMessage = (messageBody : Buffer) : [string, string] => {
    const errorCode = Number(format(bufferToInt(messageBody).int))
    console.log(errorCode)
    messageBody = messageBody.slice(4)
    
    switch (errorCode) {
        case 0x000: {
            return getServerErrorMessage(messageBody);
        }
        case 0x00A: {
            return getProtocolErrorMessage(messageBody);
        }
        case 0x0100: {
            return getAuthenticationErrorMessage(messageBody);
        }
        case 0x1000: {
            return getUnavialableExceptionMessage(messageBody);
        }
        case 0x1001: {
            return getUnavialableExceptionMessage(messageBody);
        }
        case 0x1001: {
            return getOverloadedMessage(messageBody);
        }
        case 0x1002: {
            return getIsBootstrappingMessage(messageBody);
        }
        case 0x1003: {
            return getTruncateErrorMessage(messageBody);
        }
        case 0x2000: {
            return getSyntaxErrorMessage(messageBody);
        }
        case 0x2100: {
            return getUnautorizedMessage(messageBody);
        }
        case 0x2200: {
            return getInvalidMessage(messageBody);
        }
        case 0x2300: {
            return getConfigErrorMessage(messageBody);
        }
        case 0x2400: {
            return getAlreadyExistsMessage(messageBody);
        }
        case 0x2500: {
            return getUnpreparedMessage(messageBody);
        }
    }

    return [bufferToString(messageBody).string.toString(), "Unknown Error"]
}

export default extractErrorMessage;
