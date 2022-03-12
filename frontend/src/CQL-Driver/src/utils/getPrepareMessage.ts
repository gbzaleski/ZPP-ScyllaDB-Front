import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import setLength from "./setLength";
import addPrepareBody from "./addPrepareBody";

const getPrepareMessage = (body: string) : Buffer => {
    let buffer = Frame();

    setOpcode(buffer, "PREPARE");
    setVersion(buffer, 4);

    // Prepare message + long string(int)  
    const prepareBody = Buffer.from(body, 'utf-8');
    const length = BigInt(prepareBody.length + 4)
    setLength(buffer, length)
    buffer = addPrepareBody(buffer, prepareBody, Number(length))
    return buffer;
}



export default getPrepareMessage;