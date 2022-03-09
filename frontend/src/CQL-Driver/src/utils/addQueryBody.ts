import {Buffer} from "buffer";
import {numberToInt, numberToShort} from "./conversions";
import {Byte, Consistency} from "./types";

const addQueryBody = (buffer: Buffer, queryBody: Buffer, consistency: Consistency, flag : Byte, length : number, extraData : Buffer) : Buffer => {
    const body = Buffer.alloc(length);

    const querySize = numberToInt(BigInt(queryBody.length));
    querySize.int.copy(body, 0, 0, 4);
   
    queryBody.copy(body, 4, 0, queryBody.length);
    const consistencyBody = consistency.consistency.short;
    consistencyBody.copy(body, queryBody.length + 4, 0, 2);
    const flagBody = flag.byte;
    flagBody.copy(body, queryBody.length + 6, 0, 1);
    extraData.copy(body, queryBody.length + 7, 0, extraData.length)
    
    buffer = Buffer.concat([buffer, body]);
    return buffer;
}

export default addQueryBody;

