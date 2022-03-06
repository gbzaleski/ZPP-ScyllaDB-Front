import {Buffer} from "buffer";
import {
    bufferToBytes,
    bufferToInt,
    bufferToOption,
    bufferToString,
    bufferToStringList,
    optionToReadableString
} from "./conversions";
import getLength from "./getLength";
import { getOpcodeName } from "./getOpcode";
import {type} from "../cql-types/types";
import { getTypeFrom } from "../cql-types/typeFactory";
const format = require("biguint-format");

const getVoidResult = () : string => {
    return ""
}

class RowTable {
    columns: number = 0
    rows: number = 0

    content : Array<Array<type | null>> = []

    constructor(col: number, rows : number, con : Array<Array<type | null>>) {
        this.columns = col;
        this.rows = rows;
        this.content = con;
    }
}

const getRowsResult = (driver : any, buf : Buffer) : string  | Array<Array<string>> => {
    //console.log(buf)
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
    }
    if (metaDataFlags & 4) {
        noMetaData = true
    }
    stringLen += 4
    const columnCount = Number(format(bufferToInt(buf.slice(stringLen)).int))
    stringLen += 4

    if (hasMorePages) {
        const nextPageData = bufferToBytes(buf.slice(stringLen))
        if (nextPageData != null) {
            stringLen += nextPageData.bytes.length;
            driver.setNextPageData(true, nextPageData)
        } else {
            // 4 bytes length
            stringLen += 4
            driver.setNextPageData(false, nextPageData)
        }
       
    } else {
        driver.setNextPageData(false)
    }

    let keySpaceName, tableName
    if (globalTableSpecPresent) {
        keySpaceName = bufferToString(buf.slice(stringLen))
        stringLen += Number(format(keySpaceName.length))
        tableName = bufferToString(buf.slice(stringLen))
        stringLen += Number(format(tableName.length))
    }
    

    let columnVars : any = Array.from({length: columnCount})

    for (let i = 0; i < columnCount; ++i) {
        if (!globalTableSpecPresent) {
            keySpaceName = bufferToString(buf.slice(stringLen))
            stringLen += Number(format(keySpaceName.length.short)) + 2
            tableName = bufferToString(buf.slice(stringLen))
            stringLen += Number(format(tableName.length.short)) + 2
        }
        
        let columnName = bufferToString(buf.slice(stringLen))
        //console.log(columnName.string.toString())
        stringLen += Number(format(columnName.length.short)) + 2
        let columnType = bufferToOption(buf.slice(stringLen))
        console.log(format(columnType.id.short))
        columnVars[i] = {name: columnName, type: columnType}
        //console.log(columnType)
        stringLen += columnType.size + 2
    }
    
    const rowCount = Number(format(bufferToInt(buf.slice(stringLen)).int))
    //console.log(rowCount)
    stringLen += 4
    let rows : any[] = Array.from({length: rowCount})
    for (let i = 0; i < rowCount; ++i) {
        let row : any = Array.from({length: columnCount})
        for (let j = 0; j < columnCount; ++j) {
            row[j] = bufferToBytes(buf.slice(stringLen))
            //console.log(row[j])
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
    
    console.log(rowCount, columnCount)
    for (let i = 1; i <= rowCount; ++i) {
        content[i] = Array.from({length: columnCount})
        for (let j = 0; j < columnCount; ++j) {
            console.log(format(columnVars[j].type.id.short))
            console.log(rows[i - 1][j].bytes)
            const receivedType = getTypeFrom(columnVars[j].type, rows[i - 1][j].bytes)
            //content[i] = 
            if (receivedType != null) {
                content[i][j] = receivedType.toString()
            } else {
                content[i][j] = "null"
            }
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

const getPreparedResult = () => {

}

const getSchemaChangeResult = (buf : Buffer) : string => {
    let stringLen = 0
    const changeType = bufferToString(buf).string.toString()
    console.log(changeType)
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

const getQueryResult = (driver : any, buffer: Buffer, setKeyspace: any) : string | Array<Array<string>> => {

    console.log(buffer)
    const length = getLength(buffer)
    console.log(length)
    const body = buffer.slice(9, 9 + Number(length));

    let code = Number(format(body.slice(0, 4)))
    if (getOpcodeName(buffer) == "RESULT") {
        console.log(code)
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
                return "Prepared";
            }
            case 5: {
                //return "ScehmaChange";
                return getSchemaChangeResult(body.slice(4, Number(length)));
            }
        }

        return "Invalid body code" + body.toString()
    } else {
        return getOpcodeName(buffer) + body.toString();
    }
}

export default getQueryResult;