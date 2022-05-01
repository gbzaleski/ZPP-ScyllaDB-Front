import { bufferToInt, bufferToShort, bufferToShortBytes, bufferToString, bufferToStringList } from "./conversions";
import getConsistencyName from "./getConsistencyName";
const format = require("biguint-format");

const getServerErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Server Error"]
}

const getProtocolErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Protocol Error"]
}

const getAuthenticationErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Authentication Error"]
}


const getUnavialableExceptionMessage = (errorBody: Buffer): [string, string] => {
    const consistency = bufferToShort(errorBody).short
    const required = bufferToInt(errorBody.slice(2)).int
    const alive = bufferToInt(errorBody.slice(6)).int

    const message = 
        "Consistency of query that triggered exception: " +
        getConsistencyName(Number(format(consistency))) + ". " + 
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


const getWriteTimeoutMessage = (errorBody: Buffer): [string, string] => {
    let position = 0
    const consistency = bufferToShort(errorBody.slice(position)).short
    position += 2;
    const received = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const blockFor = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const writeType = bufferToString(errorBody.slice(position)).string

    const message =
        "Consistency of query that triggered exception: " +
        getConsistencyName(Number(format(consistency))) + ". " + 
        "Nodes that acknowledged request: " +
        format(received) + ", " + 
        "Required replicas: " +
        format(blockFor) + "."
        "Type of write that timed out: " + writeType.toString()

    return [message, "Write Timeout"]
}

const getReadTimeoutMessage = (errorBody: Buffer): [string, string] => {
    let position = 0
    const consistency = bufferToShort(errorBody.slice(position)).short
    position += 2;
    const received = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const blockFor = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const dataPresent = errorBody.slice(position)

    const message =
        "Consistency of query that triggered exception: " +
        getConsistencyName(Number(format(consistency))) + ". " + 
        "Nodes that answered request: " +
        format(received) + ", " + 
        "Required replicas: " +
        format(blockFor) + "." + 
        (dataPresent[0] == 0 ? "Asked replica has not responded." : "")

    return [message, "Read Timeout"]
}

const getFunctionFailureMessage = (errorBody: Buffer): [string, string] => {
    let position = 0
    const keyspace = bufferToString(errorBody.slice(position)).string
    position += keyspace.length + 2;
    const fun = bufferToString(errorBody.slice(position)).string
    position += fun.length + 2;
    const argTypes = bufferToStringList(errorBody.slice(position)).stringList

    const message =
        "Function : " + fun.toString() +
        " with arguments: " + argTypes.join(" ") +
        " at keyspace: " + keyspace + " failed."

    return [message, "Function Timeout"]
}


const getReadFailureMessage = (errorBody: Buffer): [string, string] => {
    let position = 0
    const consistency = bufferToShort(errorBody.slice(position)).short
    position += 2;
    const received = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const blockFor = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const numFailures = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const dataPresent = errorBody.slice(position)

    const message =
        "Consistency of query that triggered exception: " +
        getConsistencyName(Number(format(consistency))) + ". " + 
        "Nodes that answered request: " +
        format(received) + ", " + 
        "Required replicas: " +
        format(blockFor) + "." + 
        "Number of nodes that failed: " + format(numFailures) +
        (dataPresent[0] == 0 ? "Asked replica has not responded." : "")

    return [message, "Read Failure"]
}


const getWriteFailureMessage = (errorBody: Buffer): [string, string] => {
    let position = 0
    const consistency = bufferToShort(errorBody.slice(position)).short
    position += 2;
    const received = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const blockFor = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const numFailures = bufferToInt(errorBody.slice(position)).int
    position += 4;
    const writeType = bufferToString(errorBody.slice(position))

    const message =
        "Consistency of query that triggered exception: " +
        getConsistencyName(Number(format(consistency))) + ". " + 
        "Nodes that answered request: " +
        format(received) + ", " + 
        "Required replicas: " +
        format(blockFor) + "." + 
        "Number of nodes that failed: " + format(numFailures) +
        "Type of write that timed out: " + writeType.toString()

    return [message, "Write Failure"]
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
        case 0x1100: {
            return getWriteTimeoutMessage(messageBody);
        }
        case 0x1200: {
            return getReadTimeoutMessage(messageBody);
        }
        case 0x1300: {
            return getReadFailureMessage(messageBody);
        }
        case 0x1400: {
            return getFunctionFailureMessage(messageBody)
        }
        case 0x1500: {
            return getWriteFailureMessage(messageBody);
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