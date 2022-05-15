import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import setLength from "./setLength";
import {bigIntToBuffer, numberToByte, numberToInt, numberToShort, tokensToValues} from "./conversions";
import addExecuteBody from "./addExecuteBody";
import { CQLDriver } from "../Driver";
import { Bytes, Option } from "./types";

const ValuesFlag : bigint = 1n
const PageSizeFlagValue : bigint = 4n
const NextPageFlagValue : bigint = 8n

const getExecuteMessage = (driver : CQLDriver, queryId: string, setLastQuery : any, bindValues : Array<string>, bindTypes : Array<Option>, pagingState? : Bytes) : Buffer => {
    let buffer = Frame();

    setLastQuery(queryId)

    const consistency = driver.getConsistency()
    const [pageSize, pagingEnabled] = driver.getPaging()

    setOpcode(buffer, "EXECUTE");
    setVersion(buffer, 4);

    let flagValue : bigint = 0n
    let extraData : Buffer = Buffer.alloc(0)

    if (bindValues != []) {
        flagValue += ValuesFlag
        extraData = Buffer.concat([extraData, tokensToValues(bindTypes, bindValues)])
    }

    // If paging is enabled we add flag value and insert page size into extraData
    if (pagingEnabled) {
        flagValue += PageSizeFlagValue
        extraData = Buffer.concat([extraData, numberToInt(BigInt(pageSize)).int])
    }

    if (pagingState) {
        flagValue += NextPageFlagValue
        extraData = Buffer.concat([extraData,numberToInt(BigInt(pagingState.bytes.length)).int, pagingState.bytes])
    }

    // Execute message + short bytes(short)*/
    
    const value = bigIntToBuffer(BigInt(queryId))
    console.log(value)
    const executeBody = Buffer.concat([numberToShort(BigInt(value.length)).short, value])
    const length = BigInt(executeBody.length + 3 + extraData.length)
    setLength(buffer, length)
    buffer = addExecuteBody(buffer, executeBody, consistency,  numberToByte(flagValue), Number(length), extraData)
    console.log(buffer)
    return buffer;
}



export default getExecuteMessage;