import { Buffer } from 'buffer';
import getMessageCode from "./getMessageCode";

const setOpcode = (buf : Buffer, messageType: String) : void => {
    // Opcode is at position 5 in the frame
    buf[5] = getMessageCode(messageType);
}
export default setOpcode;