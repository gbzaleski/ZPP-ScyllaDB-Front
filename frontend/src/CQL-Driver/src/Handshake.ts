
interface HandshakeProps {
    version: number;
    flag:    number;
    stream:  number;
}

const handshakeMessage = ({version, flag, stream} : HandshakeProps) : Uint8Array => {

    if (version < 1 || version > 4) {
        console.log("Unsupported version");
        return new Uint8Array();
    } else if (flag < 0 || flag > 255) {
        console.log("Wrong flag value");
        return new Uint8Array();
    } else if (stream < 0 || stream > 32767) {
        console.log("Wrong stream value");
        return new Uint8Array();
    }

    return Uint8Array.from([version, flag, stream, 1, 0])
}

export default handshakeMessage;