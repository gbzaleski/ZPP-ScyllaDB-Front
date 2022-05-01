import {Buffer} from 'buffer';
import {bufferToBytes} from "../utils/conversions";
import {getTypeFrom} from "./typeFactory";
const format = require("biguint-format");
import {stringify, parse} from 'uuid'

export interface type {
    toString() : string;
    toCQL() : Buffer
}

export class ASCII implements type {
    validationError : boolean = false;
    asciiText : string = ""

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            for (let pair of data.entries()) {
                if (pair[1] > 127) {
                    this.validationError = true;
                    break;
                }
                this.asciiText += String.fromCharCode(pair[1])
           }
        } else {
            this.asciiText = data;
        }
    }

    toString() {
        return this.asciiText
    }

    toCQL() {
        return Buffer.from(this.asciiText, "ascii")
    }
}

// 8 Byte signed long
export class BIGINT implements type {
    value : bigint = 0n

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.value = data.readBigInt64BE();
        } else {
            this.value = BigInt(data);
        }
    }

    toString() {
        return this.value.toString()
    }

    toCQL() {
        return Buffer.from(format(this.value, "hex"), "hex")
    }
}

// Blob is just a sequence of bytes
export class BLOB implements type {
    
    #value : BigInt = 0n

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.#value = BigInt(format(data))
        } else {
            this.#value = BigInt(data)
        }
    }

    toString() {
        return "0x" + this.#value.toString(16)
    }

    toCQL() {
        return Buffer.from(format(this.#value, "hex"), "hex")
    }
}

export class BOOLEAN implements type {
    value : boolean = false
    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            if (data.length && data[0] > 0) {
                this.value = true;
            }
        } else {
            this.value = data === "true"
        }
    }

    toString() {
        return this.value ? "True" : "False"
    }

    toCQL() {
        return Buffer.from([this.value ? 1 : 0])
    }
}

// Number represented as unscaled * 10 ^ scale
export class DECIMAL implements type {
    scale = 0n
    unscaled = 0n
    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.scale = BigInt(format(data.slice(0, 4)))
            this.unscaled = BigInt(format(data.slice(4)))
        } else {
            let parts = data.split(".")
            this.scale = BigInt(parts[1].length)
            this.unscaled = BigInt(parts[0])
        }
    }

    toString() {
        return this.unscaled.toString() + " * 10^" + this.scale.toString()
    }

    toCQL() {
        return Buffer.concat([Buffer.from(format(this.scale, "hex"), "hex"), Buffer.from(format(this.unscaled, "hex"), "hex")])
    }
}

export class DOUBLE implements type {
    value : number
    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.value = data.readDoubleBE(0)
        } else {
            this.value = 0
        }
    }

    toString() {
        return this.value.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(8)
        buf.writeDoubleBE(this.value, 0)
        return buf
    }
}

export class FLOAT implements type {
    value : number
    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.value = data.readFloatBE(0)
        } else {
            this.value = 0
        }
    }

    toString() {
        return this.value.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(8)
        buf.writeFloatBE(this.value, 0)
        return buf
    }
}

export class INET implements type {
    address : Buffer = Buffer.from("")

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.address = data
        } else {
            this.address = Buffer.from(data)
        }
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
     
    toCQL() {
        return this.address
    }
}

export class INT implements type {
    value : number = 0

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.value = data.readInt32BE(0)
        } else {
            this.value = parseInt(data)
        }
    }

    toString() {
        return this.value.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeInt32BE(this.value, 0)
        return buf
    }
}

export class LIST implements type {
    list : Array<type | null> = new Array<type | null>()

    constructor(data: Buffer | string, value: any) {
        if (data instanceof Buffer) {
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
    }

    toString() {
        return this.list.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeInt32BE(this.list.length, 0)
        for (let i = 0; i < this.list.length; ++i) {
            const el = this.list[i]
            if (el !== null) {
                buf = Buffer.concat([buf, el.toCQL()])
            }  else {
                buf = Buffer.concat([buf, Buffer.alloc(4)])
            }
        }
        return buf
    }
}

export class MAP implements type {
    container : Array<[type | null, type | null]> = new Array<[type | null, type | null]>()

    constructor(data: Buffer | string, value : any) {
        if (data instanceof Buffer) {
            const [firstVal, secondVal] = value
            const n = data.readInt32BE(0)
            let dataPart = data.slice(4)
            this.container = Array.from({length: n})
            for (let i = 0; i < n; ++i) {
                this.container[i] = [null, null]
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

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeInt32BE(this.container.length, 0)
        for (let i = 0; i < this.container.length; ++i) {
            const el1 = this.container[i][0]
            if (el1 != null) {
                buf = Buffer.concat([buf, el1.toCQL()])
            } else {
                buf = Buffer.concat([buf, Buffer.alloc(4)])
            }
            const el2 = this.container[i][1]
            if (el2 != null) {
                buf = Buffer.concat([buf, el2.toCQL()])
            } else {
                buf = Buffer.concat([buf, Buffer.alloc(4)])
            }
        }
        return buf
    }
}

export class SET implements type {
    list : Array<type | null> = new Array<type | null>()

    constructor(data: Buffer | string, value : any) {
        if (data instanceof Buffer) {
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
        //console.log(this.list.toString())
    }

    toString() {
        return this.list.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeInt32BE(this.list.length, 0)
        for (let i = 0; i < this.list.length; ++i) {
            const el = this.list[i]
            if (el != null) {
                buf = Buffer.concat([buf, el.toCQL()])
            } else {
                buf = Buffer.concat([buf, Buffer.alloc(4)])
            }
        }
        return buf
    }
}

export class SMALLINT implements type {
    value : number = 0

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.value = data.readInt16BE()
        }
    }

    toString() {
        return this.value.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(8)
        buf.writeInt16BE(this.value, 0)
        return buf
    }
}

export class TIME implements type {
    #hours : bigint = 0n;
    #minutes : bigint = 0n
    #seconds : bigint = 0n
    #nanoseconds :bigint = 0n
    #hoursRatio : bigint = 3600000000000n
    #minutesRatio : bigint = 60000000000n
    #secondsRatio : bigint = 1000000000n


    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.#nanoseconds = BigInt(data.slice(0, 4).readInt32BE(0)) * BigInt(Math.pow(2,32)) + BigInt(data.slice(4, 8).readInt32BE(0))
            if (0 < this.#nanoseconds && this.#nanoseconds < 86399999999999) {
                this.#hours = this.#nanoseconds / this.#hoursRatio
                this.#nanoseconds -= this.#hours * this.#hoursRatio
                console.log(this.#nanoseconds)
                this.#minutes = this.#nanoseconds / this.#minutesRatio
                this.#nanoseconds -= this.#minutes * this.#minutesRatio
                console.log(this.#nanoseconds)
                this.#seconds = this.#nanoseconds / this.#secondsRatio
                this.#nanoseconds -= this.#seconds * this.#secondsRatio
            }
        }
    }

    toString() {
        let result = this.#hours + ":" + this.#minutes + ":" + this.#seconds
        if (this.#nanoseconds > 0) {
            result += "." + this.#nanoseconds
        }
        return result
    }

    toCQL() {
        let buf = Buffer.alloc(8)
        buf.writeInt32BE(Number(this.#hours), 0)
        buf.writeInt32BE(Number(this.#minutes), 4)
        buf.writeInt32BE(Number(this.#seconds), 8)
        return buf
    }
}

export class DATE implements type {

    #value : Date = new Date(0)
    #days = 0

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.#days = data.slice(0, 4).readUInt32BE(0) - Math.pow(2, 31)
            this.#value = new Date(this.#days * 8.64e7)
        }
    }

    toString() {
        if (isNaN(this.#value.getUTCFullYear())) {
            return this.#days.toString() + " days from 1970-01-01"
        }
      
        return this.#value.getUTCFullYear() + "-" + (this.#value.getUTCMonth() + 1) + "-" + this.#value.getUTCDate() 
    }

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeUInt32BE(this.#days + Math.pow(2, 31), 0)
        return buf
    }
}

export class TIMESTAMP implements type {
    #value : Date = new Date(0)
    #miliseconds = 0

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.#miliseconds = data.slice(0, 4).readUInt32BE(0) * Math.pow(2, 32) + data.slice(4, 8).readUInt32BE(0)
            this.#value = new Date(this.#miliseconds)
        } else {
            this.#value = new Date(data)
            this.#miliseconds = this.#value.getTime()
        }
    }

    toString() {
        if (isNaN(this.#value.getUTCFullYear())) {
            return this.#miliseconds.toString() + " miliseconds from 1970-01-01"
        }

        return this.#value.getUTCFullYear() + "-" + (this.#value.getUTCMonth() + 1) + "-" + this.#value.getUTCDate() + " " + this.#value.getUTCHours() + ":" + this.#value.getUTCMinutes() + ":" + this.#value.getUTCSeconds() + "." + this.#value.getUTCMilliseconds()
    }

    toCQL() {
        let buf = Buffer.alloc(8)
        buf.writeUInt32BE(Math.floor(this.#miliseconds / Math.pow(2, 32)), 0)
        buf.writeUInt32BE(this.#miliseconds % Math.pow(2, 32), 4)
        return buf
    }
}

export class TINYINT implements type {
    value : number = 0

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.value = data.readInt8()
        }
    }

    toString() {
        return this.value.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(8)
        buf.writeInt8(this.value, 0)
        return buf
    }
}

export class TUPLE implements type {
    tuple : Array<type | null> = new Array<type | null>()

    constructor(data: Buffer | string, value: any) {
        if (data instanceof Buffer) {
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

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeInt32BE(this.tuple.length, 0)
        for (let i = 0; i < this.tuple.length; ++i) {
            const tupleValue = this.tuple[i]
            if (tupleValue != null) {
                buf = Buffer.concat([buf, tupleValue.toCQL()])
            }
        }
        return buf
    }
}

export class UUID implements type {
    #value : string = ""

    constructor(data: Buffer | string) {
        console.log(data)
        if (data instanceof Buffer) {
            this.#value = stringify(data)
        } else {
            this.#value = data
        }
    }

    toString() {
        return this.#value
    }

    toCQL() {
        return Buffer.from(Array.from(parse(this.#value)))
    }
}

export class VARCHAR implements type {
    #value : string = ""

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.#value = data.toString('utf8')
        }
    }

    toString() {
        return this.#value
    }

    toCQL() {
        return Buffer.from(this.#value, "utf-8")
    }
}

export class VARINT implements type {
    #value : number = 0

    constructor(data: Buffer | string) {
        if (data instanceof Buffer) {
            this.#value = data.readInt32BE()
        }
    }

    toString() {
        return this.#value.toString()
    }

    toCQL() {
        let buf = Buffer.alloc(4)
        buf.writeInt32BE(this.#value, 0)
        return buf
    }
}