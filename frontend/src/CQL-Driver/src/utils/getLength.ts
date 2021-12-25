import { Buffer } from 'buffer';
const format = require("biguint-format");

const getLength = (buf : Buffer) : bigint => {
    return BigInt(format(buf.slice(5, 9)));
}
export default getLength;