import { Buffer } from 'buffer';
import {Byte, Int, Long, Short, Uuid} from "./types";

export const numberToUuid = (value : number) : Uuid => {
    return {uuid: numberToBuffer(value, 16)}
}

export const numberToLong = (value : number) : Long => {
    return {long: numberToBuffer(value, 8)}
}

export const numberToInt = (value : number) : Int => {
    return {int: numberToBuffer(value, 4)}
}

export const numberToShort = (value : number) : Short => {
    return {short: numberToBuffer(value, 2)}
}

export const numberToByte = (value : number) : Byte => {
    return {byte: numberToBuffer(value, 1)}
}

const numberToBuffer = (value : number, size : number) : Buffer => {
    let buf = Buffer.alloc(size);
    for (let i = size - 1; i >= 0; --i) {
        buf[i] = value & 0xff;
        value >>= 1;
    }
    return buf;
}
