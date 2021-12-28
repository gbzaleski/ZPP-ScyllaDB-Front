import {Buffer} from "buffer";
import getOpcode from "./getOpcode";
import getMessageCode from "./getMessageCode";
import {bufferToString} from "./conversions";
import getLength from "./getLength";
const format = require("biguint-format");

const getVoidResult = () : string => {
    return ""
}

const getRowsResult = () => {

}

const getSetKeyspaceResult = (buf : Buffer) : string => {
    return bufferToString(buf).string.toString()
}

const getPreparedResult = () => {

}

const getSchemaChangeResult = () => {

}

const getQueryResult = (buffer: Buffer) : string => {
    const opcode = getOpcode(buffer);
    if (opcode != getMessageCode("RESULT")) {
        return "Invalid opcode received: " + opcode.toString();
    }
    console.log(buffer)
    const length = getLength(buffer)
    console.log(length)
    const body = buffer.slice(9, 9 + Number(length));

    let code = Number(format(body.slice(0, 4)))
    console.log(code)
    switch (code) {
        case 1: {
            return getVoidResult();
        }
        case 2: {
            return "Rows";
        }
        case 3: {
            return getSetKeyspaceResult(body.slice(4, Number(length)));
        }
        case 4: {
            return "Prepared";
        }
        case 5: {
            return "Schema_change";
        }
    }

    return "Invalid body code"
}

export default getQueryResult;