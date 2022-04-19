import setOpcode from "./setOpcode";
import Frame from "./FrameTemplate";
import setVersion from "./setVersion";
import { bufferToString, bufferToBytes, bufferToInt } from "./conversions";
import setLength from "./setLength";

const getAuthenticationMessage = (username : string, password: string) => {
    let buffer = Frame();

    setOpcode(buffer, "AUTH_RESPONSE");
    setVersion(buffer, 4);

    setLength(buffer, 2n)
    const usr = bufferToString(Buffer.from(username))
    const pwd = bufferToString(Buffer.from(password))
    const body = bufferToBytes(Buffer.concat([usr.string, pwd.string]))
    if (body != null) {
        setLength(buffer, BigInt(body.bytes.length))

        buffer = Buffer.concat([buffer, body.bytes])
    } else {
        setLength(buffer, 4n)
        buffer = Buffer.concat([buffer, Buffer.from([255, 255, 255, 255])])
    }
    return buffer;
}
export default getAuthenticationMessage;
