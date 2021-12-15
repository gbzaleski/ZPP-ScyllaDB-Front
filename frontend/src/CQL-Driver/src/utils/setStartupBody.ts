import {Buffer} from "buffer";
import {numberToLong} from "./conversions";

const setStartupBody = (buffer: Buffer) : void => {
    const bodySize = numberToLong(2n);
    bodySize.long.copy(buffer, 6, 0, 4);
    const body = Buffer.alloc(2);
    buffer = Buffer.concat([buffer, body], buffer.length + 2);
}

export default setStartupBody;

