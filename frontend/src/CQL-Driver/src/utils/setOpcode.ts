import { Buffer } from 'buffer';
import getMessageCode from "./getMessageCode";

const setOpcode = (buf : Buffer, messageType: String) : void => {
    // Opcode is at position 4 in the frame
    buf[4] = getMessageCode(messageType);
}
export default setOpcode;