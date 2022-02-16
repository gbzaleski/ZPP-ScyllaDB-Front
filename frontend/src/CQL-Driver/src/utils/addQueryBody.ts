import {Buffer} from "buffer";
import {numberToInt, numberToShort} from "./conversions";
import {Byte, Consistency} from "./types";

const addQueryBody = (buffer: Buffer, query: string, consistency: Consistency, flag : Byte, length : number, extraData : Buffer) : Buffer => {
    const body = Buffer.alloc(length);

    const querySize = numberToInt(BigInt(query.length));
    querySize.int.copy(body, 0, 0, 4);
    const queryBody = Buffer.from(query, 'utf-8');
    queryBody.copy(body, 4, 0, query.length);
    const consistencyBody = consistency.consistency.short;
    consistencyBody.copy(body, query.length + 4, 0, 2);
    const flagBody = flag.byte;
    flagBody.copy(body, query.length + 6, 0, 1);
    extraData.copy(body, query.length + 7, 0, extraData.length)
    
    buffer = Buffer.concat([buffer, body]);
    console.log(buffer)
    console.log(extraData)
    return buffer;
}

export default addQueryBody;

