import {Buffer} from "buffer";
import {numberToInt} from "./conversions";

const addPrepareBody = (buffer: Buffer, prepareBody: Buffer, length : number) : Buffer => {
    const body = Buffer.alloc(length);

    const prepareSize = numberToInt(BigInt(prepareBody.length));
    prepareSize.int.copy(body, 0, 0, 4);
   
    prepareBody.copy(body, 4, 0, prepareBody.length);
  
    buffer = Buffer.concat([buffer, body]);
    return buffer;
}

export default addPrepareBody;