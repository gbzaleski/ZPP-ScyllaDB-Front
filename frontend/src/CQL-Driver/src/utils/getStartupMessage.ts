import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import setStartupBody from "./setStartupBody";

const getStartupMessage = () : Buffer => {
    let buffer = Frame();
    setOpcode(buffer, "STARTUP");
    setVersion(buffer, 4);
    setStartupBody(buffer);
    return buffer;
}

export default  getStartupMessage;