import setOpcode from "./setOpcode";
import Frame from "./FrameTemplate";
import setVersion from "./setVersion";
import { bufferToString, bufferToBytes, bufferToInt } from "./conversions";
import setLength from "./setLength";

const getAuthenticationMessage = (username : string, password: string) => {
    let buffer = Frame();

    setOpcode(buffer, "AUTH_RESPONSE");
    setVersion(buffer, 4);

    console.log(username)

    const usr = Buffer.concat([Buffer.from(username), Buffer.from([0])])
    const pwd = Buffer.concat([Buffer.from(password), Buffer.from([0])])
    const len = Buffer.from([0,0,0,0])
    len.writeInt32LE(usr.length + pwd.length)
    const body = Buffer.concat([len, usr, pwd])

    if (body != null) {
        setLength(buffer, BigInt(body.length))
        buffer = Buffer.concat([buffer, body])
    } else {
        setLength(buffer, 4n)
        buffer = Buffer.concat([buffer, Buffer.from([255, 255, 255, 255])])
    }
    console.log(buffer)
    return buffer;
}
export default getAuthenticationMessage;
