import { bufferToInt, bufferToString } from "./conversions";
const format = require("biguint-format");

const getServerErrorMessage = (errorBody : Buffer) : [string, string] => {
    return [bufferToString(errorBody).string.toString(), "Server Error"]
}

const getProtocolErrorMessage = (errorBody : Buffer) : [string, string] => {
    console.log(errorBody)
    return [bufferToString(errorBody).string.toString(), "Protocol Error"]
}

const extractErrorMessage = (messageBody : Buffer) : [string, string] => {
    const errorCode = Number(format(bufferToInt(messageBody).int))
    console.log(errorCode)
    messageBody = messageBody.slice(4)
    
    switch (errorCode) {
        case 0: {
            return getServerErrorMessage(messageBody);
        }
        case 10: {
            return getProtocolErrorMessage(messageBody);
        }
    }

    return [bufferToString(messageBody).string.toString(), "Unknown Error"]
}

export default extractErrorMessage;
