import { updateNonNullExpression } from "typescript";
import {ASCII, BIGINT, BLOB, BOOLEAN, COUNTER, DECIMAL, DOUBLE, FLOAT,
        SET, INT, type, LIST, MAP, VARCHAR, UUID, TUPLE} from "./types";
const format = require("biguint-format");

export const getTypeFrom = (type: any, data: Buffer) : type | null =>  {
    const id = Number(format(type.id.short))
    const value = type.value

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
        case 12: {
            return new UUID(data)
        }
        case 13: {
            return new VARCHAR(data)
        }
        case 32 : {
            return new LIST(data, value)
        }
        case 33: {
            return new MAP(data, value)
        }
        case 34: {
            return new SET(data, value)
        }
        case 49: {
            return new TUPLE(data, value)
        }
    }
    return null;
}