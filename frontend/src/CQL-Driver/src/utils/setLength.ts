import { Buffer } from 'buffer';
import {numberToInt} from "./conversions";

const setLength = (buf : Buffer, length: bigint) : Buffer => {
    const bodySize = numberToInt(length);
    bodySize.int.copy(buf, 5, 0, 4);
    return buf;
}
export default setLength;