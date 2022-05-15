import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import addStartupBody from "./addStartupBody";
import setLength from "./setLength";

const getStartupMessage = () : Buffer => {
    let buffer = Frame();
    setOpcode(buffer, "STARTUP");
    setVersion(buffer, 4);
    setLength(buffer, 2n)
    buffer = addStartupBody(buffer);
    return buffer;
}

export default  getStartupMessage;