interface type {
    toString() : string;
}

class ASCII implements type {
    validationError : boolean = false;
    asciiText : string = ""

    constructor(data: Buffer) {
        for (var pair of data.entries()) {
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

class BIGINT implements type {
    value : bigint = 0n

    toString() {
        return ""
    }
}

class BLOB implements type {
    toString() {
        return ""
    }
}

class BOOLEAN implements type {
    toString() {
        return ""
    }
}

class DATE implements type {
    toString() {
        return ""
    }
}

class DECIMAL implements type {
    toString() {
        return ""
    }
}

class DOUBLE implements type {
    toString() {
        return ""
    }
}

class FLOAT implements type {
    toString() {
        return ""
    }
}

class INET implements type {
    toString() {
        return ""
    }
}

class INT implements type {
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