import {numberToByte, numberToLong, numberToInt, numberToUuid, numberToShort} from "../../src/CQL-Driver/src/utils/conversions";
import { expect } from 'chai';
import * as crypto from "crypto";
const format = require("biguint-format");

describe('Converting number to byte', () => {
    it('Min value', () => {
        expect(Buffer.compare(numberToByte(0n).byte, Buffer.from([0]))).to.equal(0);
    });
    it('Max value', () => {
        expect(Buffer.compare(numberToByte(255n).byte, Buffer.from([255]))).to.equal(0);
    });
    it('Random value', () => {
        const random = BigInt(format(crypto.randomBytes(1), 'dec'));
        expect(Buffer.compare(numberToByte(BigInt(random)).byte, Buffer.from([Number(random)]))).to.equal(0);
    });
});

describe('Converting number to short', () => {
    it('Min value', () => {
        expect(Buffer.compare(numberToShort(0n).short, Buffer.from([0, 0]))).to.equal(0);
    });
    it('Max value', () => {
        expect(Buffer.compare(numberToShort(65535n).short, Buffer.from([255, 255]))).to.equal(0);
    });
    it('Random value', () => {
        const random = BigInt(format(crypto.randomBytes(2), 'dec'));
        expect(Buffer.compare(numberToShort(BigInt(random)).short, Buffer.from([
            Number(random >> 8n & 0xffn), Number(random & 0xffn)
        ]))).to.equal(0);
    });
});

describe('Converting number to int', () => {
    it('Min value', () => {
        expect(Buffer.compare(numberToInt(0n).int, Buffer.from([0, 0, 0, 0]))).to.equal(0);
    });
    it('Max value', () => {
        expect(Buffer.compare(numberToInt(4294967295n).int, Buffer.from([
            255, 255, 255, 255
        ]))).to.equal(0);
    });
    it('Random value', () => {
        const random = BigInt(format(crypto.randomBytes(4), 'dec'));
        expect(Buffer.compare(numberToInt(random).int, Buffer.from([
            Number(random >> 24n & 0xffn), Number(random >> 16n & 0xffn),
            Number(random >> 8n & 0xffn), Number(random & 0xffn)
        ]))).to.equal(0);
    });
});

describe('Converting number to long', () => {
    it('Min value', () => {
        expect(Buffer.compare(numberToLong(0n).long, Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]))).to.equal(0);
    });
    it('Max value', () => {
        expect(Buffer.compare(numberToLong(18446744073709551615n).long, Buffer.from([
            255, 255, 255, 255, 255, 255, 255, 255
        ]))).to.equal(0);
    });
    it('Random value', () => {
        const random = BigInt(format(crypto.randomBytes(8), 'dec'));
        expect(Buffer.compare(numberToLong(random).long, Buffer.from([
            Number(random >> 56n & 0xffn), Number(random >> 48n & 0xffn),
            Number(random >> 40n & 0xffn), Number(random >> 32n & 0xffn),
            Number(random >> 24n & 0xffn), Number(random >> 16n & 0xffn),
            Number(random >> 8n & 0xffn), Number(random & 0xffn)
        ]))).to.equal(0);
    });
});


describe('Converting number to uuid', () => {
    it('Min value', () => {
        expect(Buffer.compare(numberToUuid(0n).uuid, Buffer.from([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]))).to.equal(0);
    });
    it('Max value', () => {
        expect(Buffer.compare(numberToUuid(340282366920938463463374607431768211455n).uuid, Buffer.from([
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255
        ]))).to.equal(0);
    });
    it('Random value', () => {
        const random = BigInt(format(crypto.randomBytes(16), 'dec'));
        expect(Buffer.compare(numberToUuid(random).uuid, Buffer.from([
            Number(random >> 120n & 0xffn), Number(random >> 112n & 0xffn),
            Number(random >> 104n & 0xffn), Number(random >> 96n & 0xffn),
            Number(random >> 88n & 0xffn), Number(random >> 80n & 0xffn),
            Number(random >> 72n & 0xffn), Number(random >> 64n & 0xffn),
            Number(random >> 56n & 0xffn), Number(random >> 48n & 0xffn),
            Number(random >> 40n & 0xffn), Number(random >> 32n & 0xffn),
            Number(random >> 24n & 0xffn), Number(random >> 16n & 0xffn),
            Number(random >> 8n & 0xffn), Number(random & 0xffn)
        ]))).to.equal(0);
        console.log(numberToShort(BigInt(-1)))
    });
});




