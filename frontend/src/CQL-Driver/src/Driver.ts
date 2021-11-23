import handshakeMessage from "./functions/Handshake"

class CQLDriver {
    handshake = handshakeMessage.bind(this)
}

export {CQLDriver}