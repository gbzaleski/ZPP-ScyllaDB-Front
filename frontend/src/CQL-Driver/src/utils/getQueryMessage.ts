import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import {Consistency} from "./types";
import setLength from "./setLength";
import addQueryBody from "./addQueryBody";
import {numberToByte} from "./conversions";

const getQueryMessage = (body: string, consistency: Consistency) : Buffer => {
    let buffer = Frame();
    setOpcode(buffer, "QUERY");
    setVersion(buffer, 4);
    // Basic query - long string(int) + consistency(short) + flag(byte)
    const length = BigInt(body.length + 7)
    setLength(buffer, length)
    buffer = addQueryBody(buffer, body, consistency,  numberToByte(0n), Number(length))

    return buffer;
}

export default getQueryMessage;