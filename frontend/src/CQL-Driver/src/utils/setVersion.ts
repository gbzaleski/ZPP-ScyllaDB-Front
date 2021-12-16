import { Buffer } from 'buffer';

const setVersion = (buf : Buffer, version: number) : Buffer => {
    // Version is at position 0 in the frame
    buf[0] = version;
    return buf;
}
export default setVersion;