import handshakeMessage from "./functions/Handshake"
import {Bytes, Consistency} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {numberToShort} from "./utils/conversions";
import getQueryMessage from "./utils/getQueryMessage";
import getQueryResult from "./utils/getQueryResult";

class CQLDriver {
    #consistency: Consistency
    #keyspace : string
    #pageSize: number
    #pagingEnabled : boolean
    #pagingStates : Array<Bytes>
    #pagingIndex : number
    #lastQuery: string
    #expectedIndex : number
    #expectingNewQuery : boolean

    constructor() {
        this.#consistency = getConsistency("ONE");
        this.#keyspace = ""
        this.#pageSize = 2
        this.#pagingEnabled = true
        this.#pagingStates = []
        this.#pagingIndex = -1
        this.#expectedIndex = 0
        this.#lastQuery = ""
        this.#expectingNewQuery = true
    }

    handshake = handshakeMessage.bind(this)

    query = (body : string, pagingState? : Bytes) : Buffer => {
        this.#expectedIndex = 0
        this.clearPagingStates()
        return getQueryMessage(this, body, this.#setLastQuery, pagingState);
    }

    getNextPageQuery = () : Buffer | null => {
        const wantedIndex = this.#pagingIndex + 1
        return this.#getQueryPageAt(wantedIndex)
    }

    getNumberOfLoadedPages = () : number => {
        return this.#pagingStates.length + 1
    }

    getPreviousPageQuery = () : Buffer | null => {
        const wantedIndex = this.#pagingIndex - 1
        return this.#getQueryPageAt(wantedIndex)
    }

    #getQueryPageAt = (index: number) : Buffer | null => {
        const [isFirstPage, pagingState] = this.#getPagingState(index)
        this.#expectedIndex = index

        if (isFirstPage && pagingState == null) {
            return getQueryMessage(this, this.#lastQuery, this.#setLastQuery);
        } else if (pagingState == null) {
            return null
        }

        return getQueryMessage(this, this.#lastQuery, this.#setLastQuery, pagingState);
    }

    getExpectedIndex = () : number => {
        return this.#expectedIndex
    }

    getExpectingNewQuery = () : boolean => {
        return this.#expectingNewQuery
    }

    setPageNumber = (page: number) : void => {
        this.#pagingIndex = page
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

    #setLastQuery = (query : string) : void => {
        this.#lastQuery = query;
    }

    getLastQuery = () : string => {
        return this.#lastQuery
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

    #getPagingState = (index: number) :  [boolean, Bytes | null]  => {
       
        if (index == 0) {
            return [true, null]
        } else if (index < 0 || index - 1 >= this.#pagingStates.length) {
            return [false, null]
        }

        return [false, this.#pagingStates[index - 1]]
    }

    getPageNumber = () : number => {
        return this.#pagingIndex
    }

    clearPagingStates = () : void => {
        this.#pagingStates = []
    }

    addPagingState = (nextPagingState : Bytes) : void => {
        this.#pagingStates.push(nextPagingState)
    }

    setPaging = (mode : string, size? : number) => {
        if (size) {
            this.#pageSize = size;
        }
        
        if (mode.toUpperCase() == "ON") {
            this.#pagingEnabled = true
        } else if (mode.toUpperCase() == "OFF") {
            this.#pagingEnabled = false
        } 
    }

    getPaging = () : [number, boolean] => {
        return [this.#pageSize, this.#pagingEnabled]
    }

    getResponse = (buf: Buffer) => {
        return getQueryResult(this, buf, this.#setKeyspace)
    }
}

export {CQLDriver}