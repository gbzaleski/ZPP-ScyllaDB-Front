import {Blob, Buffer} from 'buffer';
import {bufferToBytes, bufferToInt, numberToInt} from "../utils/conversions";
import {getTypeFrom} from "./typeFactory";
const format = require("biguint-format");

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
        return ""
    }
}

// 8 Byte signed long
export class BIGINT implements type {
    value : bigint = 0n

    constructor(data: Buffer) {
        this.value = data.readBigInt64BE();
    }

    toString() {
        return ""
    }
}

// Blob is just a sequence of bytes
export class BLOB implements type {
    value: Blob = new Blob([""]);
     
    constructor(data : Buffer) {
        this.value =  new Blob([new Uint8Array(data)])
    }

    toString() {
        return ""
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
        return ""
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
        return ""
    }
}

export class FLOAT implements type {
    value : number
    constructor(data: Buffer) {
        this.value = data.readFloatBE(0)
    }

    toString() {
        return ""
    }
}
export class INET implements type {
    address : Buffer = Buffer.from("")

    constructor(data: Buffer) {
        this.address = data
    }

    toString() {
        return ""
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
        data = data.slice(4)
        this.container = Array.from({length: n})
        for (let i = 0; i < n; ++i) {
            this.container[i] = [null, null]
            let bytes = bufferToBytes(data);
            if (bytes != null) {
                this.container[i][0] = getTypeFrom(firstVal, bytes.bytes);
                data = data.slice(bytes.bytes.length + 4)
            }

            bytes = bufferToBytes(data);
            if (bytes != null) {
                this.container[i][1] = getTypeFrom(secondVal, bytes.bytes);
                data = data.slice(bytes.bytes.length + 4)
            }
        }
    }

    toString() {
        return this.container.toString()
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

class TEXT implements type {
   #value : string = ""

    constructor(data: Buffer) {
        this.#value = data.toString('utf8')
    }

    toString() {
        return this.#value
    }
}

class TIME implements type {
    toString() {
        return ""
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
        return ""
    }
}

class TUPLE implements type {
    toString() {
        return ""
    }
}

class UUID implements type {
    toString() {
        return ""
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