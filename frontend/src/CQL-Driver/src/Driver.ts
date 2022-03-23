import handshakeMessage from "./functions/Handshake"
import {Bytes, Consistency, Option} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {numberToShort} from "./utils/conversions";
import getQueryMessage from "./utils/getQueryMessage";
import getQueryResult from "./utils/getQueryResult";
import getPrepareMessage from "./utils/getPrepareMessage";
import getExecuteMessage from "./utils/getExecuteMessage";
/*
interface Driver {
    connect(websocket : any, setResponse : any, setTableResponse) : void
    sendQuery() : void
    prepare(body : string) : void
    execute(body : string, bindValues : Array<string>) : Buffer | null
    setKeyspace() : void
    setConsistency(body : string) : void
    getConsistencyName() : string
    setPaging(mode : string, size? : number) : void
    getNextPage() : void
    getPreviousPage() : void
}*/

class CQLDriver {
    #shouldSaveData : boolean
    #consistency: Consistency
    #keyspace : string
    #pageSize: number
    #pagingEnabled : boolean
    #pagingStates : Array<Bytes>
    #pagingIndex : number
    #lastQuery: string
    #lastQueryType : string
    #expectedIndex : number
    #expectingNewQuery : boolean
    #bindValues : Array<string>
    #preparedStatements : Map<bigint, Array<Option>>
    #driverState : Map<string, any>
    
    constructor() {
        console.log("constructing object")
        let isSaving = window.sessionStorage.getItem('driverState');
        let driverState = window.sessionStorage.getItem("driverState")
        if (isSaving == null || driverState == null || JSON.parse(isSaving) == false) {
            this.#driverState = new Map()
            this.#shouldSaveData = false
            this.#consistency = getConsistency("ONE");
            this.#driverState.set("consistency", this.#consistency)
            this.#keyspace = ""
            this.#driverState.set("keyspace", this.#keyspace)
            this.#pageSize = 6
            this.#driverState.set("pageSize", this.#pageSize)
            this.#pagingEnabled = true
            this.#driverState.set("pagingEnabled", this.#pagingEnabled)
            this.#pagingStates = []
            this.#driverState.set("pagingStates", this.#pagingStates)
            this.#pagingIndex = -1
            this.#driverState.set("pagingIndex", this.#pagingIndex)
            this.#expectedIndex = 0
            this.#driverState.set("expectedIndex", this.#expectedIndex)
            this.#lastQuery = ""
            this.#driverState.set("lastQuery", this.#lastQuery)
            this.#lastQueryType = "QUERY"
            this.#driverState.set("lastQueryType", this.#lastQueryType)
            this.#expectingNewQuery = true
            this.#driverState.set("expectingNewQuery", this.#expectingNewQuery)
            this.#bindValues = []
            this.#driverState.set("bindValues", this.#bindValues)
            this.#preparedStatements = new Map()
            this.#driverState.set("preparedStatements", this.#preparedStatements)


            if (isSaving == null) {
                this.#shouldSaveData = true
                this.enableSaving()
            }
        } else {
            console.log("something up there")
            this.#shouldSaveData = true
            this.#driverState = new Map(JSON.parse(driverState))
            this.#consistency = this.#driverState.get('consistency')
            this.#keyspace = this.#driverState.get('keyspace')
            console.log(this.#keyspace)
            this.#pageSize = this.#driverState.get('pageSize')
            this.#pagingEnabled = this.#driverState.get('pagingEnabled')
            this.#pagingStates = this.#driverState.get('pagingStates')
            this.#pagingIndex = this.#driverState.get('pagingIndex')
            this.#expectedIndex = this.#driverState.get('expectedIndex')
            this.#lastQuery = this.#driverState.get('lastQuery')
            this.#lastQueryType = this.#driverState.get('lastQueryType')
            this.#expectingNewQuery = this.#driverState.get('expectingNewQuery')
            this.#bindValues = this.#driverState.get('bindValues')
            this.#preparedStatements = this.#driverState.get('preparedStatements')
        }
    }

    enableSaving = () : void => {
        window.sessionStorage.setItem('isSaving', JSON.stringify(true))
        //console.log(new Map(JSON.parse(JSON.stringify([...this.#driverState.entries()]))))
        window.sessionStorage.setItem('driverState', JSON.stringify([...this.#driverState.entries()]))
    }

    disableSaving = () : void => {
        window.sessionStorage.setItem('isSaving', JSON.stringify(false))
        window.sessionStorage.removeItem('driverState')
    }


    handshake = handshakeMessage.bind(this)

    #addPreparedStatement = (id: bigint, values: Array<Option>) : void => {
        this.#preparedStatements.set(id, values)
    }

    getResponse = (buf: Buffer) => {
        return getQueryResult(this, buf, this.#setKeyspace, this.#addPreparedStatement)
    }

    connect = (websocket : any, setResponse : any, setTableResponse : any) : boolean => {
        let driver = this
        websocket.current.addEventListener('open', function (event : any) {
            console.log('Connected to the WS Server!')
        });
        const coder = new TextEncoder()
        websocket.current.send(coder.encode(driver.handshake()));

         // Connection closed
         websocket.current.addEventListener('close', function (event: any) {
            console.log('Disconnected from the WS Server!')
        });

        // Listen for messages
        
        websocket.current.addEventListener('message', function (event: any) {
            event.data.arrayBuffer().then((response: any) => {
                response = driver.getResponse(Buffer.from(response))
                if (typeof response == "string") {
                    setResponse(response)
                } else {
                    setTableResponse(response)
                }
            })
        });

        return true;
    }

    query = (body : string, pagingState? : Bytes) : Buffer => {
        this.#expectedIndex = 0
        this.clearPagingStates()
        this.#lastQueryType = "QUERY"
        this.#bindValues = []
        return getQueryMessage(this, body, this.#setLastQuery, pagingState);
    }

    prepare = (body : string) : Buffer => {
        return getPrepareMessage(body)
    }

    execute = (body : string, bindValues : Array<string>) : Buffer | null => {
        this.#expectedIndex = 0
        this.clearPagingStates()
        this.#lastQueryType = "EXECUTE"
        this.#bindValues = bindValues
        console.log(BigInt(body))
        const result = this.#preparedStatements.get(BigInt(body))

        if (result == undefined) {
            return null
        }
        console.log(result)
        return getExecuteMessage(this, body, this.#setLastQuery, this.#bindValues, result);
    }

    getNextPageQuery = () : Buffer | null => {
        console.log(this.#pagingStates)
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
            if (this.#lastQueryType == "EXECUTE") {
                const result = this.#preparedStatements.get(BigInt(this.#lastQuery))

                if (result == undefined) {
                    return null
                }
                return getExecuteMessage(this, this.#lastQuery, this.#setLastQuery, this.#bindValues, result);
            } else {
                return getQueryMessage(this, this.#lastQuery, this.#setLastQuery);
            }
        } else if (pagingState == null) {
            return null
        }
        if (this.#lastQueryType == "EXECUTE") {
            const result = this.#preparedStatements.get(BigInt(this.#lastQuery))

            if (result == undefined) {
                return null
            }
            return getExecuteMessage(this, this.#lastQuery, this.#setLastQuery, this.#bindValues, result, pagingState);
        } else {
            return getQueryMessage(this, this.#lastQuery, this.#setLastQuery, pagingState);
        }
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
        this.#driverState.set('keyspace', keyspace)
        window.sessionStorage.setItem('driverState', JSON.stringify([...this.#driverState.entries()]))
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
}

export {CQLDriver}