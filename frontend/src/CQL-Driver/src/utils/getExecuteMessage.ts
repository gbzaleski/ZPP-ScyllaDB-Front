import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import setLength from "./setLength";
import addPrepareBody from "./addPrepareBody";
import {numberToShort} from "./conversions";
const format = require("biguint-format");

const getExecuteMessage = (queryId: string) : Buffer => {
    let buffer = Frame();

    setOpcode(buffer, "EXECUTE");
    setVersion(buffer, 4);

    // Execute message + short bytes(short)  
    const value = Buffer.from(queryId)
    const executeBody = Buffer.concat([numberToShort(BigInt(format(value))).short, value])
    const length = BigInt(executeBody.length + 2)
    setLength(buffer, length)
    buffer = addPrepareBody(buffer, executeBody, Number(length))
    return buffer;
}



export default getExecuteMessage;