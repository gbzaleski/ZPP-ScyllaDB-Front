import handshakeMessage from "./functions/Handshake"
import {Consistency} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {numberToShort} from "./utils/conversions";

class CQLDriver {
    #consistency: Consistency

    constructor() {
        this.#consistency = getConsistency("ONE");
    }

    handshake = handshakeMessage.bind(this)
    setConsistency = (s : string) => {
        const received = getConsistency(s);
        if (Buffer.compare(received.consistency.short, numberToShort(BigInt(-1)).short) != 0) {
            this.#consistency = received;
            return 0
        }
        return -1
    }
    getConsistency = () : string => {
        return this.#consistency.name
    }
}

export {CQLDriver}