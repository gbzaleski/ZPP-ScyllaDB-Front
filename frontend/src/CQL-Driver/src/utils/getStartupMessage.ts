import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import addStartupBody from "./addStartupBody";

const getStartupMessage = () : Buffer => {
    let buffer = Frame();
    setOpcode(buffer, "STARTUP");
    setVersion(buffer, 4);
    console.log(buffer)
    buffer = addStartupBody(buffer);
    console.log(buffer)
    return buffer;
}

export default  getStartupMessage;