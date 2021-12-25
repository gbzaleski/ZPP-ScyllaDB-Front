import handshakeMessage from "./functions/Handshake"
import {Consistency} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {numberToShort} from "./utils/conversions";
import getQueryMessage from "./utils/getQueryMessage";
import getQueryResult from "./utils/getQueryResult";

class CQLDriver {
    #consistency: Consistency

    constructor() {
        this.#consistency = getConsistency("ONE");
    }

    handshake = handshakeMessage.bind(this)

    query = (body : string) : Buffer => {
        return getQueryMessage(body, this.#consistency);
    }

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

    getResponse = (s: string) => {
        return getQueryResult(s)
    }
}

export {CQLDriver}