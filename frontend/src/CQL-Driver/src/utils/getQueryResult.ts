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
import { getOpcode, getOpcodeName } from "./getOpcode";
import {type} from "../cql-types/types";
import {getTypeFrom} from "../cql-types/typeFactory";
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

const getRowsResult = (buf : Buffer) : string => {
    console.log(buf)
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
    let keySpaceName, tableName
    if (globalTableSpecPresent) {
        keySpaceName = bufferToString(buf.slice(stringLen))
        stringLen += Number(format(keySpaceName.length))
        tableName = bufferToString(buf.slice(stringLen))
        stringLen += Number(format(tableName.length))
    }
    console.log(globalTableSpecPresent)
    let columnVars : any = Array.from({length: columnCount})
    for (let i = 0; i < columnCount; ++i) {
        if (!globalTableSpecPresent) {
            console.log("XD")
            keySpaceName = bufferToString(buf.slice(stringLen))
            stringLen += Number(format(keySpaceName.length.short)) + 2
            tableName = bufferToString(buf.slice(stringLen))
            stringLen += Number(format(tableName.length.short)) + 2
        }
        
        let columnName = bufferToString(buf.slice(stringLen))
        console.log(columnName.string)
        stringLen += Number(format(columnName.length.short)) + 2
        let columnType = bufferToOption(buf.slice(stringLen))
        console.log(format(columnType.id.short))
        columnVars[i] = {name: columnName, type: columnType}
        stringLen += columnType.size + 2
    }
    
    const rowCount = Number(format(bufferToInt(buf.slice(stringLen)).int))
    console.log(rowCount)
    stringLen += 4
    let rows : any[] = Array.from({length: rowCount})
    for (let i = 0; i < rowCount; ++i) {
        let row : any = Array.from({length: columnCount})
        for (let j = 0; j < columnCount; ++j) {
            row[j] = bufferToBytes(buf.slice(stringLen))
            console.log(row[j])
            stringLen += 4
            if (row[j] != null) {
                stringLen += Number(format(row[j].length.int))
            }
        }
        rows[i] = row
    }
    
    let result = ""
    console.log(columnCount)
    for (let i = 0; i < columnCount; ++i) {
        console.log(columnVars[i])
        result += columnVars[i].name.string.toString() + " ";
    }
    result += "\n"

    let content : Array<Array<type | null>> = []

    for (let i = 0; i < rowCount; ++i) {
        for (let j = 0; j < columnCount; ++j) {
            content[i][j] = getTypeFrom(Number(format(columnVars[j].type.id)), rows[i][j])
        }
    }

    const resultTable = new RowTable(columnCount, rowCount, content)
    console.log(resultTable.content)
    return result
}

const getSetKeyspaceResult = (buf : Buffer) : string => {
    return bufferToString(buf).string.toString()
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

const getQueryResult = (buffer: Buffer) : string => {

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
                return getRowsResult(body.slice(4, Number(length)))
            }
            case 3: {
                return getSetKeyspaceResult(body.slice(4, Number(length)));
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