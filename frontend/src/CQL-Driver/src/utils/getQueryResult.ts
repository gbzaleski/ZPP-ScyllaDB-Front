import {Buffer} from "buffer";
import getOpcode from "./getOpcode";
import getMessageCode from "./getMessageCode";
import {bufferToString, bufferToStringList} from "./conversions";
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

const getSchemaChangeResult = (buf : Buffer) => {
    let stringLen = 0
    const changeType = bufferToString(buf).string.toString()
    stringLen += changeType.length + 2
    const target = bufferToString(buf.slice(stringLen)).string.toString()
    stringLen += target.length + 2
    let option = ""

    if (target == "KEYSPACE") {
        option = bufferToString(buf.slice(stringLen)).string.toString()
    } else if (target == "TABLE" || target == "TYPE") {
        const object = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += object.length + 2
        const name = bufferToString(buf.slice(stringLen)).string.toString()
        option = object + name
    } else if (target == "FUNCTION" || target == "AGGREGATE") {
        const keyspace = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += keyspace.length + 2
        const fun = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += keyspace.length + 2
        const args = bufferToStringList(buf.slice(stringLen))
        option = keyspace + fun
        for (let i = 0; i < format(args.length.short); ++i) {
            option += args.stringList[i].string.toString()
        }
    }

    return changeType + target + option
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
            return getSchemaChangeResult(body.slice(4, Number(length)));
        }
    }

    return "Invalid body code"
}

export default getQueryResult;