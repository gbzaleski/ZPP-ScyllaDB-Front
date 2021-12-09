import { Buffer } from 'buffer';
import {Byte, Int, Long, Short, Uuid} from "./types";

export const numberToUuid = (value : bigint) : Uuid => {
    return {uuid: bigIntToBuffer(value, 16)}
}

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

const bigIntToBuffer = (value : bigint, size : number) : Buffer => {
    let buf = Buffer.alloc(size);
    for (let i = size - 1; i >= 0; --i) {
        buf[i] = Number(value & BigInt(0xff));
        value >>= 8n;
    }
    return buf;
}
