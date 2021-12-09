import getStartupMessage from "../utils/getStartupMessage";


const handshakeMessage = () : string => {
    return getStartupMessage().toString();
}

export default handshakeMessage;