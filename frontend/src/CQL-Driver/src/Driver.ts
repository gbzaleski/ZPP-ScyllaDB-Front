import handshakeMessage from "./functions/Handshake"
import {Consistency} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {numberToShort} from "./utils/conversions";
import getQueryMessage from "./utils/getQueryMessage";
import getQueryResult from "./utils/getQueryResult";

class CQLDriver {
    #consistency: Consistency
    #keyspace : string

    constructor() {
        this.#consistency = getConsistency("ONE");
        this.#keyspace = ""
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

    #setKeyspace = (keyspace : string) => {
        this.#keyspace = keyspace
    }

    getKeyspace = () : string => {
        return this.#keyspace
    }

    getConsistency = () : string => {
        return this.#consistency.name
    }

    getResponse = (buf: Buffer) => {
        return getQueryResult(buf, this.#setKeyspace)
    }
}

export {CQLDriver}