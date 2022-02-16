import {Blob} from 'buffer';
import {bufferToInt} from "../utils/conversions";
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
        data = data.slice(0, 8)
        const val = BigInt(format(data))

        if ((val & (1n << 63n)) != 0n) {
            const bound = (1n << 64n);
            this.value = -bound + (val & (bound - 1n))
        } else {
            this.value = val
        }
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
        this.value = data.readDoubleLE()
    }

    toString() {
        return ""
    }
}

export class FLOAT implements type {
    value : number
    constructor(data: Buffer) {
        this.value = data.readFloatLE()
    }

    toString() {
        return ""
    }
}

export class INET implements type {
    toString() {
        return ""
    }
}

export class INT implements type {
    value : bigint = 0n

    constructor(data: Buffer) {
        data = data.slice(0, 4)
        const val = BigInt(format(data))

        if ((val & (1n << 31n)) != 0n) {
            const bound = (1n << 32n);
            this.value = -bound + (val & (bound - 1n))
        } else {
            this.value = val
        }
    }
    toString() {
        return ""
    }
}

class LIST implements type {
    toString() {
        return ""
    }
}

class MAP implements type {
    toString() {
        return ""
    }
}

class SET implements type {
    toString() {
        return ""
    }
}

class TEXT implements type {
    toString() {
        return ""
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

class VARCHAR implements type {
    toString() {
        return ""
    }
}

class VARINT implements type {
    toString() {
        return ""
    }
}