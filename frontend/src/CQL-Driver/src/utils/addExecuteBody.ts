import {Buffer} from "buffer";
import {numberToInt} from "./conversions";
import {Byte, Consistency} from "./types";

const addExecuteBody = (buffer: Buffer, executeBody: Buffer, consistency: Consistency, flag : Byte, length : number, extraData : Buffer) : Buffer => {
    const body = Buffer.alloc(length);
   
    executeBody.copy(body, 0, 0, executeBody.length);
    const consistencyBody = consistency.consistency.short;
    consistencyBody.copy(body, executeBody.length, 0, 2);
    const flagBody = flag.byte;
    flagBody.copy(body, executeBody.length + 2, 0, 1);
    extraData.copy(body, executeBody.length + 3, 0, extraData.length)
    
    buffer = Buffer.concat([buffer, body]);
    return buffer;
}

export default addExecuteBody;
