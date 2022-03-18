import {Buffer} from "buffer";
import {
    bufferToBytes,
    bufferToInt,
    bufferToOption,
    bufferToShort,
    bufferToShortBytes,
    bufferToString,
    bufferToStringList
} from "./conversions";
import {Option} from "./types";
import getLength from "./getLength";
import { getOpcodeName } from "./getOpcode";
import { getTypeFrom } from "../cql-types/typeFactory";
import { CQLDriver } from "../Driver";
const format = require("biguint-format");

const getVoidResult = () : string => {
    return ""
}

const getRowsResult = (driver : CQLDriver, buf : Buffer) : string  | Array<Array<string>> => {
    let stringLen = 0
    let globalTableSpecPresent = false
    let hasMorePages = false
    let noMetaData = false
    const metaDataFlags = Number(format(bufferToInt(buf).int))

    if (metaDataFlags & 1) {
        globalTableSpecPresent = true
    }
    if (metaDataFlags & 2) {
        hasMorePages = true
        console.log("wincej page'y")
    }
    if (metaDataFlags & 4) {
        noMetaData = true
    }
    stringLen += 4
    const columnCount = Number(format(bufferToInt(buf.slice(stringLen)).int))
    stringLen += 4

    if (hasMorePages) {
        const pagingState = bufferToBytes(buf.slice(stringLen))
        if (pagingState != null) {
            stringLen += pagingState.bytes.length + 4;
            if (driver.getExpectedIndex() == driver.getNumberOfLoadedPages() - 1) {
                driver.addPagingState(pagingState)
            }
            driver.setPageNumber(driver.getExpectedIndex())
        } else {
            stringLen += 4
        }
        console.log(pagingState)
    } else {
       console.log(buf)
       driver.setPageNumber(driver.getExpectedIndex())
    }

    let keySpaceName, tableName
    if (globalTableSpecPresent) {
        keySpaceName = bufferToString(buf.slice(stringLen))
        stringLen += Number(format(keySpaceName.length))
        tableName = bufferToString(buf.slice(stringLen))
        stringLen += Number(format(tableName.length))
    }
    

    let columnVars : any = Array.from({length: columnCount})
    console.log(columnCount)
    for (let i = 0; i < columnCount; ++i) {
        if (!globalTableSpecPresent) {
            keySpaceName = bufferToString(buf.slice(stringLen))
            stringLen += Number(format(keySpaceName.length.short)) + 2
            tableName = bufferToString(buf.slice(stringLen))
            stringLen += Number(format(tableName.length.short)) + 2
        }
        
        let columnName = bufferToString(buf.slice(stringLen))
        console.log(columnName.string.toString())
        stringLen += Number(format(columnName.length.short)) + 2
        let columnType = bufferToOption(buf.slice(stringLen))
        console.log(format(columnType.id.short))
        columnVars[i] = {name: columnName, type: columnType}
        //console.log(columnType)
        stringLen += columnType.size + 2
    }
    
    const rowCount = Number(format(bufferToInt(buf.slice(stringLen)).int))
    console.log(rowCount)
    stringLen += 4
    let rows : any[] = Array.from({length: rowCount})
    console.log(rowCount)
    for (let i = 0; i < rowCount; ++i) {
        let row : any = Array.from({length: columnCount})
        for (let j = 0; j < columnCount; ++j) {
            console.log(buf.slice(stringLen))
            row[j] = bufferToBytes(buf.slice(stringLen))
            console.log(row[j])
            stringLen += 4
            if (row[j] != null) {
                stringLen += Number(format(row[j].length.int))
            }
        }
        rows[i] = row
    }
   
    let content : Array<Array<string>> = Array.from({length: rowCount + 1})
  
    content[0] = Array.from({length: columnCount})
    for (let j = 0; j < columnCount; ++j) {
        content[0][j] = columnVars[j].name.string.toString()
    }
   
    // Creating final array
    for (let i = 1; i <= rowCount; ++i) {
        content[i] = Array.from({length: columnCount})
        for (let j = 0; j < columnCount; ++j) {
            console.log(format(columnVars[j].type.id.short))
            if (rows[i - 1][j] != null) {
            //console.log()
                const receivedType = getTypeFrom(columnVars[j].type, rows[i - 1][j].bytes)
                if (receivedType != null) {
                    content[i][j] = receivedType.toString()
                } else {
                    content[i][j] = "null"
                }
            } else {
                content[i][j] = "null"
            }
            //content[i] = 
            
        }
    }

    return content
}

const getSetKeyspaceResult = (buf : Buffer, setKeyspace : (arg0: string) => void) : string => {
    const keyspaceName =  bufferToString(buf).string.toString()
    setKeyspace(keyspaceName)
    const response = "Changed keyspace to " + keyspaceName
    return response
}

const getPreparedResult = (buf : Buffer, addPreparedStatement : any) : string => {
    const idBuffer = bufferToShortBytes(buf).shortBytes
    const id = BigInt(format(bufferToShortBytes(buf).shortBytes))
    let globalTableSpecPresent = false


    buf = buf.slice(idBuffer.length + 2)
    const metaDataFlags = Number(format(bufferToInt(buf).int))

    if (metaDataFlags & 1) {
        globalTableSpecPresent = true
    }

    buf = buf.slice(4)
    const columnCount = Number(format(bufferToInt(buf).int))
    buf = buf.slice(4)
    const pkCount = Number(format(bufferToInt(buf).int))
    buf = buf.slice(4)
    console.log(pkCount)
    for (let i = 0; i < pkCount; ++i) {
        const pkIndex = Number(format(bufferToShort(buf).short))
        buf = buf.slice(2)
    }
    let columnValues : Array<Option> = Array.from({length: columnCount})
    let keySpaceName, tableName
    console.log(columnCount)
    for (let i = 0; i < columnCount; ++i) {
        if (!globalTableSpecPresent) {
            keySpaceName = bufferToString(buf)
            buf.slice(Number(format(keySpaceName.length.short)) + 2)
            tableName = bufferToString(buf)
            buf.slice(Number(format(tableName.length.short)) + 2)
        }
        
        let columnName = bufferToString(buf)
        buf = buf.slice(Number(format(columnName.length.short)) + 2)
        let columnType = bufferToOption(buf)
        columnValues[i] = columnType
        //console.log(columnType)
        buf = buf.slice(columnType.size + 2)
    }
    console.log(columnValues)
    addPreparedStatement(id, columnValues)

    return "Prepared statement with id " + id.toString()
}

const getSchemaChangeResult = (buf : Buffer) : string => {
    let stringLen = 0
    const changeType = bufferToString(buf).string.toString()
    stringLen += changeType.length + 2
    const target = bufferToString(buf.slice(stringLen)).string.toString()
    stringLen += target.length + 2
    let option = ""

    if (target == "KEYSPACE") {
        option = bufferToString(buf.slice(stringLen)).string.toString()
    } else if (target == "TABLE" || target == "TYPE") {
        const object = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += object.length + 2
        const name = bufferToString(buf.slice(stringLen)).string.toString()
        option = object + " " + name
    } else if (target == "FUNCTION" || target == "AGGREGATE") {
        const keyspace = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += keyspace.length + 2
        const fun = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += keyspace.length + 2
        const args = bufferToStringList(buf.slice(stringLen))
        option = keyspace + " " + fun
        for (let i = 0; i < format(args.length.short); ++i) {
            option += " " + args.stringList[i].string.toString()
        }
    }

    return changeType + " " + target + " " + option
}

const getQueryResult = (driver : any, buffer: Buffer, setKeyspace: any, addPreparedStatement : any) : string | Array<Array<string>> => {

    //console.log(buffer)
    const length = getLength(buffer)
    //console.log(length)
    const body = buffer.slice(9, 9 + Number(length));

    let code = Number(format(body.slice(0, 4)))
    if (getOpcodeName(buffer) == "RESULT") {
        switch (code) {
            case 1: {
                return getVoidResult();
            }
            case 2: {
                //return "Rows";
                return getRowsResult(driver, body.slice(4, Number(length)))
            }
            case 3: {
                return getSetKeyspaceResult(body.slice(4, Number(length)), setKeyspace);
            }
            case 4: {
                return getPreparedResult(body.slice(4, Number(length)), addPreparedStatement);
            }
            case 5: {
                return getSchemaChangeResult(body.slice(4, Number(length)));
            }
        }

        return "Invalid body code" + body.toString()
    } else {
        return getOpcodeName(buffer) + body.toString();
    }
}

export default getQueryResult;