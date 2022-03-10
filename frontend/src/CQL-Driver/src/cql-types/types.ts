import {Buffer} from 'buffer';
import {bufferToBytes, bufferToInt, numberToInt} from "../utils/conversions";
import {getTypeFrom} from "./typeFactory";
const format = require("biguint-format");
import {stringify} from 'uuid'

export interface type {
    toString() : string;
}

export class ASCII implements type {
    validationError : boolean = false;
    asciiText : string = ""

    constructor(data: Buffer) {
        for (let pair of data.entries()) {
            if (pair[1] > 127) {
                this.validationError = true;
                break;
            }
            this.asciiText += String.fromCharCode(pair[1])
        }
    }

    toString() {
        return this.asciiText
    }
}

// 8 Byte signed long
export class BIGINT implements type {
    value : bigint = 0n

    constructor(data: Buffer) {
        this.value = data.readBigInt64BE();
    }

    toString() {
        return this.value.toString()
    }
}

// Blob is just a sequence of bytes
export class BLOB implements type {
    
    #value : BigInt = 0n

    constructor(data : Buffer) {
        this.#value = BigInt(format(data))
    }

    toString() {
        return "0x" + this.#value.toString(16)
    }
}

export class BOOLEAN implements type {
    value : boolean = false
    constructor(data: Buffer) {
        if (data.length && data[0] > 0) {
            this.value = true;
        }
    }

    toString() {
        return this.value ? "True" : "False"
    }
}

export class COUNTER implements type {
    constructor(data: Buffer) {

    }

    toString() {
        return ""
    }
}

// Number represented as unscaled * 10 ^ scale
export class DECIMAL implements type {
    scale = 0n
    unscaled = 0n
    constructor(data: Buffer) {
        this.scale = BigInt(format(data.slice(0, 4)))
        this.unscaled = BigInt(format(data.slice(4)))
    }

    toString() {
        return ""
    }
}

export class DOUBLE implements type {
    value : number
    constructor(data: Buffer) {
        this.value = data.readDoubleBE(0)
    }

    toString() {
        return this.value.toString()
    }
}

export class FLOAT implements type {
    value : number
    constructor(data: Buffer) {
        this.value = data.readFloatBE(0)
    }

    toString() {
        return this.value.toString()
    }
}
export class INET implements type {
    address : Buffer = Buffer.from("")

    constructor(data: Buffer) {
        this.address = data
    }

    toString() {
        if (this.address.length == 4) {
            return this.address.join('.').toString()
        } else if (this.address.length == 6) {
            return "unimplemented"
        } else {
            return "invalid address"
        }
    }
}

export class INT implements type {
    value : number = 0

    constructor(data: Buffer) {
        this.value = data.readInt32BE(0)
    }

    toString() {
        return this.value.toString()
    }
}

export class LIST implements type {
    list : Array<type | null> = new Array<type | null>()

    constructor(data: Buffer, value : any) {
        const n = data.readInt32BE(0)
        data = data.slice(4)
        this.list = Array.from({length: n})
        for (let i = 0; i < n; ++i) {
            let bytes = bufferToBytes(data);
            if (bytes != null) {
                this.list[i] = getTypeFrom(value, bytes.bytes);
                data = data.slice(bytes.bytes.length + 4)
            }
        }
    }

    toString() {
        return this.list.toString()
    }
}

export class MAP implements type {
    container : Array<[type | null, type | null]> = new Array<[type | null, type | null]>()

    constructor(data: Buffer, value : any) {
        const [firstVal, secondVal] = value
        const n = data.readInt32BE(0)
        let dataPart = data.slice(4)
        this.container = Array.from({length: n})
        for (let i = 0; i < n; ++i) {
            this.container[i] = [null, dataPart]
            let bytes = bufferToBytes(dataPart);
        
            if (bytes != null) {
                this.container[i][0] = getTypeFrom(firstVal, bytes.bytes);
                dataPart = dataPart.slice(bytes.bytes.length + 4)
 
            }
            
            bytes = bufferToBytes(dataPart);
            if (bytes != null) {
                this.container[i][1] = getTypeFrom(secondVal, bytes.bytes);
                dataPart = dataPart.slice(bytes.bytes.length + 4)
            }
        }
    }

    toString() {
        let resultString = "{"
        for (let i = 0; i < this.container.length; ++i) {
            const [key, value] = this.container[i]
            //if (key != null) {console.log(key.toString())}
            const keyString = key != null ? key.toString() : "null"
            const valueString =value != null ? value.toString() : "null"
            resultString += keyString + " : " + valueString + ", "
        }
        resultString = resultString.replace(/..$/,"}")
        return resultString
    }
}

export class SET implements type {
    list : Array<type | null> = new Array<type | null>()

    constructor(data: Buffer, value : any) {
        const n = data.readInt32BE(0)
        data = data.slice(4)
        this.list = Array.from({length: n})
        for (let i = 0; i < n; ++i) {
            let bytes = bufferToBytes(data);
            if (bytes != null) {
                this.list[i] = getTypeFrom(value, bytes.bytes);
                data = data.slice(bytes.bytes.length + 4)
            }
        }
        //console.log(this.list.toString())
    }

    toString() {
        return this.list.toString()
    }
}

export class SMALLINT implements type {
    value : number = 0

    constructor(data: Buffer) {
        this.value = data.readInt16BE()
    }

    toString() {
        return ""
    }
}

export class TIME implements type {
    #hours : bigint = 0n;
    #minutes : bigint = 0n
    #seconds : bigint = 0n
    #nanoseconds :bigint = 0n
    #hoursRatio : bigint = 3600000000000n
    #minutesRatio : bigint = 60000000000n
    #secondsRatio : bigint = 60000000000n


    constructor(data: Buffer) {
        this.#nanoseconds = data.slice(0, 8).readBigInt64BE(0)
        if (0 < this.#nanoseconds && this.#nanoseconds < 86399999999999) {
            this.#hours = this.#nanoseconds / this.#hoursRatio
            this.#nanoseconds -= this.#hours * this.#hoursRatio

            this.#minutes = this.#nanoseconds / this.#minutesRatio
            this.#nanoseconds -= this.#minutes * this.#minutesRatio

            this.#seconds = this.#nanoseconds / this.#secondsRatio
            this.#nanoseconds -= this.#hours * this.#secondsRatio
        }
    }

    toString() {
        return this.#hours + ":" + this.#minutes + ":" + this.#seconds
    }
}

class TIMESTAMP implements type {
    toString() {
        return ""
    }
}

class TINYINT implements type {
    value : number = 0

    constructor(data: Buffer) {
        this.value = data.readInt8()
    }

    toString() {
        return this.value.toString()
    }
}

export class TUPLE implements type {
    tuple : Array<type | null> = new Array<type | null>()

    constructor(data: Buffer, value : any) {
        const n = value.length
        this.tuple = Array.from({length: n})
        for (let i = 0; i < n; ++i) {
            let bytes = bufferToBytes(data);
            if (bytes != null) {
                //console.log(value[i])
                this.tuple[i] = getTypeFrom(value[i], bytes.bytes);
                data = data.slice(bytes.bytes.length + 4)
            }
        }
    }

    toString() {
        let resultString = "("
        for (let i = 0; i < this.tuple.length; ++i) {
            const tupleValue = this.tuple[i]
            const stringValue = tupleValue != null ? tupleValue.toString() : "null"
           
            resultString += stringValue + ", "
        }
        resultString = resultString.replace(/..$/,")")
        return resultString
    }
}

export class UUID implements type {
    #value : string = ""

    constructor(data: Buffer) {
        this.#value = stringify(data)
    }

    toString() {
        return this.#value
    }
}

export class VARCHAR implements type {
    #value : string = ""

    constructor(data: Buffer) {
        this.#value = data.toString('utf8')
    }

    toString() {
        return this.#value
    }
}

export class VARINT implements type {
    toString() {
        return ""
    }
}