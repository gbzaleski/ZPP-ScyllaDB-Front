
interface HandshakeProps {
    version: number;
    flag:    number;
    stream:  number;
}

const convToBin = (num: number) : string => {
    return (num >>> 0).toString()
}

const handshakeMessage = ({version, flag, stream} : HandshakeProps) : string => {

    if (version < 0 || version > 255) {
        console.log("Wrong version value");
        return "";
    } else if (flag < 0 || flag > 255) {
        console.log("Wrong flag value");
        return "";
    } else if (stream < 0 || stream > 32767) {
        console.log("Wrong stream value");
        return "";
    }
    return String.fromCodePoint(version, flag, stream, 0)
}

export default handshakeMessage;