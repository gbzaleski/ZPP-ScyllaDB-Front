import { Buffer } from 'buffer';

const setVersion = (buf : Buffer, version: number) : Buffer => {
    // Version is at position 5 in the frame
    buf[0] = version;
    return buf;
}
export default setVersion;