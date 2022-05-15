import handshakeMessage from "./functions/Handshake"
import {Bytes, Consistency, Option} from "./utils/types";
import getConsistency from "./functions/Consistency";
import {numberToShort} from "./utils/conversions";
import getQueryMessage from "./utils/getQueryMessage";
import getQueryResult from "./utils/getQueryResult";
import getPrepareMessage from "./utils/getPrepareMessage";
import getExecuteMessage from "./utils/getExecuteMessage";
import getAuthenticationMessage from "./utils/getAuthenticationMessage";
import getLength from "./utils/getLength";
import {Blob} from 'buffer'
import {isBrowser} from "browser-or-node"
import { WebSocket as WWebSocket} from "ws";


class CQLDriver {
    #websocket : any
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
    #lastHeader : Buffer
    #lastBody : Buffer
    #preparedStatements : Map<bigint, Array<Option>>

    constructor() {
        this.#websocket = isBrowser ? new WebSocket("ws://localhost:8222", "cql")
        : this.#websocket = new WWebSocket('ws://localhost:8222', "cql")
        this.#consistency = getConsistency("ONE");
        this.#keyspace = ""
        this.#pageSize = 6
        this.#pagingEnabled = true
        this.#pagingStates = []
        this.#pagingIndex = -1
        this.#expectedIndex = 0
        this.#lastBody = Buffer.from("")
        this.#lastHeader = Buffer.from("")
        this.#lastQuery = ""
        this.#lastQueryType = "QUERY"
        this.#expectingNewQuery = true
        this.#bindValues = []
        this.#preparedStatements = new Map()
    }


    handshake = handshakeMessage.bind(this)

    authenticate = (login : string, passwd : string) => {
        this.#checkSend(this.#websocket, getAuthenticationMessage(login, passwd))
    } 

    #addPreparedStatement = (id: bigint, values: Array<Option>) : void => {
        this.#preparedStatements.set(id, values)
    }

    setLastBody = (buf : Buffer) : void => {
        this.#lastBody = buf
    }

    setLastHeader = (buf: Buffer) : void => {
        this.#lastHeader = buf
    }

    recreate = (adress : string, port : string) => {
        this.#websocket.close()
        this.#websocket = isBrowser ? new WebSocket("ws://" + adress + ":" + port, "cql")
        : this.#websocket = new WWebSocket("ws://" + adress + ":" + port, "cql")
        const waitForFlag = async (condition: () => Boolean) => {
            return new Promise<void>((resolve, reject) => {
                const interval = setInterval(() => {
                    if (!condition()) { return };
                    clearInterval(interval);
                    resolve();
                }, 100);
        
                setTimeout(() => {
                    clearInterval(interval);
                    reject("Waited too long for response");
                }, 5000);
            });
        };

        return waitForFlag(() => this.isWebReady())
    }

    isWebReady = () => {
        return this.#websocket.readyState == 0x1
    }

    getResponse = (buf: Buffer) : [string | Array<Array<string>>, string] => {
        if (this.#lastBody == Buffer.from("")) {
            return getQueryResult(this, buf, this.#setKeyspace, this.#addPreparedStatement)
        } else {
            this.#lastBody = Buffer.concat([this.#lastBody, buf])
            if (getLength(this.#lastHeader) <= this.#lastBody.length) {
                return getQueryResult(this, Buffer.concat([this.#lastHeader, this.#lastBody]), this.#setKeyspace, this.#addPreparedStatement)
            } else {
                return ["Not complete response",""]
            }
        }
    }

    #checkSend = (ws : any, msg : Uint8Array) => {
        if (ws.readyState == 1) {
            ws.send(msg);
        }
    }

    connect = (setResponse : any, setTableResponse : any, user: string, passwd : string) : boolean => {
        let driver = this
        let ws = this.#websocket

        ws.addEventListener('open', function (event : any) {
            console.log('Connected to the WS Server!')
        });
        // Connection closed
        ws.addEventListener('close', function (event: any) {
            console.log('Disconnected from the WS Server!')
        });

        // Listen for messages
        const coder = new TextEncoder()

        ws.addEventListener('message', function (event: any) {
          
            let received = event.data
            if (Buffer.isBuffer(event.data)) {
                received = new Blob([event.data]) 
            }

            //event.data=new Blob(event.data)
            received.arrayBuffer().then((response: any) => {
                response = driver.getResponse(Buffer.from(response))
                if (typeof response[0] == "string") {
                    if (response[1] == "READY" || response[1] == "AUTH_SUCCESS") {
                        setResponse([response[0], ""])
                    } else if (response[1] == "AUTHENTICATE") {
                        driver.authenticate(user, passwd)                   
                    } else {
                        setResponse(response)
                    }
                } else {
                    setTableResponse(response[0])
                } 
            })
        });

        
        this.#checkSend(ws, (coder.encode(driver.handshake())));

        return true;
    }

    isReady = () => {
        return this.#websocket.readyState == 0x1
    }

    endWebsocket = () => {
        this.#websocket.close()
    }

    query = (body : string, pagingState? : Bytes) : void => {
        this.#expectedIndex = 0
        this.clearPagingStates()
        this.#lastQueryType = "QUERY"
        this.#bindValues = []
        this.#checkSend(this.#websocket, getQueryMessage(this, body, this.#setLastQuery, pagingState));
    }

    prepare = (body : string) : void => {
        this.#checkSend(this.#websocket, getPrepareMessage(body))
    }

    execute = (body : string, bindValues : Array<string>) : void | string => {
        this.#expectedIndex = 0
        this.clearPagingStates()
        this.#lastQueryType = "EXECUTE"
        this.#bindValues = bindValues
        const result = this.#preparedStatements.get(BigInt(body))
        if (result == undefined) {
            return "Query with id " + body + " is not prepared";
        }
       
        this.#checkSend(this.#websocket, getExecuteMessage(this, body, this.#setLastQuery, this.#bindValues, result));
    }

    getNextPageQuery = () : void => {
        const wantedIndex = this.#pagingIndex + 1
        const queryPage = this.#getQueryPageAt(wantedIndex)
        if (queryPage != null) {
            this.#checkSend(this.#websocket, (queryPage))
        }
    }

    getNumberOfLoadedPages = () : number => {
        return this.#pagingStates.length + 1
    }

    hasPreviousPage = () : boolean => {
        if (this.getPageNumber() > 0) {
            return true
        }
        return false
    }

    hasNextPage = () : boolean => {
        if (this.getPageNumber() < this.#pagingStates.length) {
            return true
        }
        return false
    }

    getPreviousPageQuery = () : void => {
        const wantedIndex = this.#pagingIndex - 1
        const queryPage = this.#getQueryPageAt(wantedIndex)
        if (queryPage != null) {
            this.#checkSend(this.#websocket, queryPage)
        }
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