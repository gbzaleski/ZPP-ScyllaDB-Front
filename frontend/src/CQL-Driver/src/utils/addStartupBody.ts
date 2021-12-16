import {Buffer} from "buffer";
import {numberToInt} from "./conversions";

const addStartupBody = (buffer: Buffer) : Buffer => {
    const bodySize = numberToInt(2n);
    bodySize.int.copy(buffer, 5, 0, 4);
    const body = Buffer.alloc(2);
    buffer = Buffer.concat([buffer, body], buffer.length + 2);
    return buffer;
}

export default addStartupBody;

