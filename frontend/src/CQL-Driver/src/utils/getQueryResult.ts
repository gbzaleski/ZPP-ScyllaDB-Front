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
const format = require("biguint-format");

const getVoidResult = () : string => {
    return ""
}

const getRowsResult = (buf : Buffer) : string => {
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
        stringLen += format(keySpaceName.length)
        tableName = bufferToString(buf.slice(stringLen))
        stringLen += format(tableName.length)
    }

    let columnVars : any = Array.from({length: columnCount})
    for (let i = 0; i < columnCount; ++i) {
        if (!globalTableSpecPresent) {
            keySpaceName = bufferToString(buf.slice(stringLen))
            stringLen += format(keySpaceName.length)
            tableName = bufferToString(buf.slice(stringLen))
            stringLen += format(tableName.length)
        }

        let columnName = bufferToString(buf.slice(stringLen))
        columnVars[i].name = columnName
        stringLen += format(columnName.length)
        let type = bufferToOption(buf.slice(stringLen))
        columnVars[i].type = type
        stringLen += type.size
    }

    const rowCount = Number(format(bufferToInt(buf.slice(stringLen)).int))
    let rows : any[] = Array.from({length: rowCount})
    for (let i = 0; i < rowCount; ++i) {
        let row : any = Array.from({length: columnCount})
        for (let j = 0; j < columnCount; ++j) {
            row[j] = bufferToBytes(buf.slice(stringLen))
            stringLen += 4
            if (row[j] != null) {
                stringLen += format(row[j].length)
            }
        }
        rows[i] = row
    }

    let result = ""

    for (let i = 0; i < columnCount; ++i) {
        result += columnVars[i].name.string.toString() + " ";
    }
    result += "\n"

    /*for (let i = 0; i < rowCount; ++i) {
        for (let j = 0; j < columnCount; ++j) {
            result += optionToReadableString(columnVars[i].type, rows[i][j])
        }
    }*/

    return result
}

const getSetKeyspaceResult = (buf : Buffer) : string => {
    return bufferToString(buf).string.toString()
}

const getPreparedResult = () => {

}

const getSchemaChangeResult = (buf : Buffer) => {
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
        option = object + name
    } else if (target == "FUNCTION" || target == "AGGREGATE") {
        const keyspace = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += keyspace.length + 2
        const fun = bufferToString(buf.slice(stringLen)).string.toString()
        stringLen += keyspace.length + 2
        const args = bufferToStringList(buf.slice(stringLen))
        option = keyspace + fun
        for (let i = 0; i < format(args.length.short); ++i) {
            option += args.stringList[i].string.toString()
        }
    }

    return changeType + target + option
}

const getQueryResult = (buffer: Buffer) : string => {

    console.log(buffer)
    const length = getLength(buffer)
    console.log(length)
    const body = buffer.slice(9, 9 + Number(length));

    let code = Number(format(body.slice(0, 4)))
    console.log(code)
    switch (code) {
        case 1: {
            return getVoidResult();
        }
        case 2: {
            return "Rows";
        }
        case 3: {
            return getSetKeyspaceResult(body.slice(4, Number(length)));
        }
        case 4: {
            return "Prepared";
        }
        case 5: {
            return getSchemaChangeResult(body.slice(4, Number(length)));
        }
    }

    return "Invalid body code" + body.toString()
}

export default getQueryResult;