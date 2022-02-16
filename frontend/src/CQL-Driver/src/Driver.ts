import handshakeMessage from "./functions/Handshake"
import {Bytes, Consistency} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {bufferToBytes, numberToInt, numberToShort} from "./utils/conversions";
import getQueryMessage from "./utils/getQueryMessage";
import getQueryResult from "./utils/getQueryResult";

class CQLDriver {
    #consistency: Consistency
    #keyspace : string
    #pageSize: Number
    #pagingEnabled : Boolean
    #nextPageData : Bytes | null
    #hasMorePages : Boolean

    constructor() {
        this.#consistency = getConsistency("ONE");
        this.#keyspace = ""
        this.#pageSize = 100
        this.#pagingEnabled = true
        this.#nextPageData = bufferToBytes(Buffer.from(""))
        this.#hasMorePages = false
    }

    handshake = handshakeMessage.bind(this)

    query = (body : string) : Buffer => {
        return getQueryMessage(this, body);
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

    getConsistencyName = () : string => {
        return this.#consistency.name
    }

    getConsistency = () : Consistency => {
        return this.#consistency
    }

    getNextPageData = () : [Boolean, (Bytes | null)] => {
        return [this.#hasMorePages, this.#nextPageData]
    }

    setNextPageData = (hasMorePages : Boolean, nextPageData? : Bytes) : void => {
        this.#hasMorePages = hasMorePages
        if (nextPageData) {
            this.#nextPageData = nextPageData
        }
    }

    setPaging = (mode : string, size? : Number) => {
        if (size) {
            this.#pageSize = size;
        }
        
        if (mode.toUpperCase() == "ON") {
            this.#pagingEnabled = true
        } else if (mode.toUpperCase() == "OFF") {
            this.#pagingEnabled = false
        } 
    }

    getPaging = () : [Number, Boolean] => {
        return [this.#pageSize, this.#pagingEnabled]
    }

    getResponse = (buf: Buffer) => {
        return getQueryResult(this, buf, this.#setKeyspace)
    }
}

export {CQLDriver}