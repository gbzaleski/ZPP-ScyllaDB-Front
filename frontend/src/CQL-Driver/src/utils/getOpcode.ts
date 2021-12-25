import { Buffer } from 'buffer';

const getOpcode = (buf : Buffer) : number => {
    // Opcode is at position 4 in the frame
    return buf[4]
}
export default getOpcode;