import { Buffer } from 'buffer';
import {Byte, Int, Long, Short, String, StringList, Option, Bytes, ShortBytes} from "./types";
const format = require("biguint-format");
import {parse} from 'uuid'
import { getTypeFrom } from '../cql-types/typeFactory';

export const numberToLong = (value: bigint) : Long => {
    return {long: bigIntToBuffer(value, 8)}
}

export const numberToInt = (value : bigint) : Int => {
    return {int: bigIntToBuffer(value, 4)}
}

export const numberToShort = (value : bigint) : Short => {
    return {short: bigIntToBuffer(value, 2)}
}

export const numberToByte = (value : bigint) : Byte => {
    return {byte: bigIntToBuffer(value, 1)}
}

export const bufferToShort = (buf : Buffer) : Short => {
    return {short : buf.slice(0, 2)}
}

export const bufferToInt = (buf : Buffer) : Int => {
    return {int : buf.slice(0, 4)}
}

export const bufferToOption = (buf : Buffer) : Option  =>  {
    const id = bufferToShort(buf);
    let stringLen = 2
    const idVal = format(id.short)
    let size = 0
    let value = null

    if (idVal == 0) {
        value = bufferToString(buf.slice(stringLen))
    } else if (idVal == 32 || idVal == 34) {
        value = bufferToOption(buf.slice(stringLen))
        size += value.size + 2
    } else if (idVal == 33) {
        const fst = bufferToOption(buf.slice(stringLen))
        stringLen += fst.size
        const snd = (bufferToOption(buf.slice(stringLen)))
        size += fst.size + snd.size + 4
        value = [fst, snd]

    } else if (idVal == 48) {
        const keyspace = bufferToString(buf.slice(stringLen))
        stringLen += 2
        const udt = bufferToString(buf.slice(stringLen))
        stringLen += 2
        const n = format(bufferToShort(buf.slice(stringLen)).short)

        stringLen += 2

        let udtList : any[] = Array.from({length: n})
        for (let i = 0; i < n; ++i) {
            udtList[i].name =  bufferToString(buf.slice(stringLen));
            stringLen += format(udtList[i].name.length)
            udtList[i].option = bufferToOption(buf.slice(stringLen))
            stringLen += udtList[i].option.size
        }

        value = [keyspace, udt, udtList]

    } else if (idVal == 49) {
        const n = format(bufferToShort(buf.slice(stringLen)).short)
    
        stringLen += 2
        size += 2

        let optionList : any[] = Array.from({length: n})
       
        for (let i = 0; i < n; ++i ) {
            optionList[i] = bufferToOption(buf.slice(stringLen))
            stringLen += optionList[i].size + 2
            size += optionList[i].size + 2
        }
        value = optionList
    }
    
    return {id: id, value : value, size: size}
}

export const bufferToString = (buf : Buffer) : String => {
    const len = Number(format(buf.slice(0, 2)))
    return {length: numberToShort(BigInt(len)), string: buf.slice(2, len + 2)}
}

export const bufferToBytes = (buf : Buffer) : Bytes | null => {
    const len = buf.readInt32BE(0)
    if (len < 0) {
        return null;
    }
    return {length: numberToInt(BigInt(len)), bytes: buf.slice(4, len + 4)}
}

export const bufferToShortBytes = (buf : Buffer) : ShortBytes => {
    let len = Number(format(buf.slice(0, 2)))
    if (len < 0) {
        len = 0
    }
    return {length: numberToShort(BigInt(len)), shortBytes: buf.slice(2, len + 2)}
}

export const optionToReadableString = (id : Short, byt: Bytes) : string => {
    const idVal = format(id.short)

    let result = "";
    let buf = byt.bytes

    // Ascii
    if (idVal == 1) {
        for (let i = 0; i < format(buf.length); ++i) {
            if (buf[i] > 127) {
                // Some error handling
            } else {
                result += buf[i].toString()
            }
        }
        return result;
    }
    // Bigint
    else if (idVal == 2) {
        return buf.readBigInt64BE(0).toString();
    }
    // Blob
    else if (idVal == 3) {
        return buf.toString()
    }
    // Boolean
    else if (idVal == 4) {
        if (buf[0] == 0) {
            return "False"
        } else {
            return "True"
        }
    }
    // Date
    else if (idVal == 5) {

    }
    // Decimal
    else if (idVal == 6) {
        return buf.readFloatLE(0).toString();
    }
    // Double
    else if (idVal == 7) {
        return buf.readDoubleBE(0).toString();
    }
    // Float
    else if (idVal == 8) {

    }
    // Int
    else if (idVal == 12) {
        return buf.toString()
    }
    return ""
}

export const bufferToStringList = (buf : Buffer) : StringList => {
    const len = format(buf.slice(0, 2))
    let parsed = 2
    let result : String[] = []
    for (let i = 0; i < len; ++i) {
        const newItem = bufferToString(buf.slice(parsed))
        parsed += format(newItem.length) + 2
        result.push(newItem)
    }
    return  {length: numberToShort(len), stringList: result}
}

const stringToValue = (option : Option, textValue : string) : Buffer => {
    if (textValue == "null") {
        return Buffer.from([-1])
    }

    const type = getTypeFrom(option, textValue)

    // TODO : handle null

    let typeVal : Buffer
    if (type == null) {
        typeVal = Buffer.from("null")
    }
    else {
        typeVal = type.toCQL()
        console.log(typeVal)
    }

    //const val : ArrayLike<number> = parse(textValue)
    const result = Buffer.concat([numberToInt(BigInt(typeVal.length)).int, typeVal])
    return result
}

export const tokensToValues = (types : Array<Option>, values : Array<string>) : Buffer => {
    let results = numberToShort(BigInt(values.length)).short

    for (let i = 0; i < values.length; ++i) {
        results = Buffer.concat([results, stringToValue(types[i], values[i])])
    }

    return results
}

export const bigIntToBuffer = (value : bigint, size? : number) : Buffer => {
    if (!size) {
        console.log(value)
        let tempSize = 1, mul = 256n
        while (value >= mul) {
            mul *= 256n
            tempSize += 1
        }
        size = tempSize
        console.log(size)
        let buf = Buffer.alloc(size);
        for (let i = size - 1; i >= 0; --i) {
            buf[i] = Number(value & BigInt(0xff));
            value >>= 8n;
        }
        console.log(buf, buf.length)
        return buf;
    } else {
        let buf = Buffer.alloc(size);
        for (let i = size - 1; i >= 0; --i) {
            buf[i] = Number(value & BigInt(0xff));
            value >>= 8n;
        }
        return buf;
    }
}
