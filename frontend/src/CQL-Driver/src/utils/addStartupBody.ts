import {Buffer} from "buffer";

const addStartupBody = (buffer: Buffer) : Buffer => {
    const body = Buffer.alloc(2);
    buffer = Buffer.concat([buffer, body], buffer.length + 2);
    return buffer
}

export default addStartupBody;

