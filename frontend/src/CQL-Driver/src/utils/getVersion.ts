import { Buffer } from 'buffer';

const getVersion = (buf : Buffer) : number => {
    // Opcode is at position 4 in the frame
    return buf[0]
}
export default getVersion;