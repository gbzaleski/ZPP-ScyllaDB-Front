import {ASCII, BIGINT, BLOB, BOOLEAN, COUNTER, DECIMAL, DOUBLE, FLOAT, INT, type, LIST} from "./types";

export const getTypeFrom = (type: any, data: Buffer) : type | null =>  {
    const id = type.id
    const value = type.val

    switch (id) {
        case 1: {
            return new ASCII(data);
        }
        case 2: {
            return new BIGINT(data);
        }
        case 3: {
            return new BLOB(data);
        }
        case 4: {
            return new BOOLEAN(data)
        }
        case 5: {
            return new COUNTER(data)
        }
        case 6: {
            return new DECIMAL(data)
        }
        case 7: {
            return new DOUBLE(data)
        }
        case 8: {
            return new FLOAT(data)
        }
        case 9: {
            return new INT(data)
        }
        case 32 : {
            return new LIST()
        }
    }
    return null;
}