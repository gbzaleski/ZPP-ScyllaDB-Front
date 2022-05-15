import {ASCII, BIGINT, BLOB, BOOLEAN, DECIMAL, DOUBLE, FLOAT,
        SET, INT, type, LIST, MAP, VARCHAR, UUID, TUPLE, INET, TIME, DATE, SMALLINT, TINYINT, TIMESTAMP} from "./types";
const format = require("biguint-format");

export const getTypeFrom = (type: any, data: Buffer | string) : type | null =>  {
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
        case 11: {
            return new TIMESTAMP(data)
        }
        case 12: {
            return new UUID(data)
        }
        case 13: {
            return new VARCHAR(data)
        }
        case 16: {
            return new INET(data)
        }
        case 17: {
            return new DATE(data)
        }
        case 18: {
            return new TIME(data)
        }
        case 19: {
            return new SMALLINT(data)
        }
        case 20: {
            return new TINYINT(data)
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