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

const getQueryResult = (result: string) : string => {
    const buffer = Buffer.from(result, 'utf8');
    const opcode = getOpcode(buffer);
    if (opcode != getMessageCode("RESULT")) {
        return "Invalid opcode received";
    }

    const length = getLength(buffer)

    const body = buffer.slice(9, 9 + Number(length));

    const code = format(body.slice(0, 4))

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