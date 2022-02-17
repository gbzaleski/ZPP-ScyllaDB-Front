import Frame from "./FrameTemplate";
import setOpcode from "./setOpcode";
import setVersion from "./setVersion";
import {Buffer} from "buffer";
import {Consistency} from "./types";
import setLength from "./setLength";
import addQueryBody from "./addQueryBody";
import {numberToByte, numberToInt} from "./conversions";

const PageSizeFlagValue : bigint = 4n
const NextPageFlagValue : bigint = 8n

const getQueryMessage = (driver: any, body: string) : Buffer => {
    let buffer = Frame();
    const consistency = driver.getConsistency()
    const [pageSize, pagingEnabled] = driver.getPaging()
    const [hasMorePages, nextPageData] = driver.getNextPageData()
    setOpcode(buffer, "QUERY");
    setVersion(buffer, 4);

    let flagValue : bigint = 0n
    let extraData : Buffer = Buffer.alloc(0)

    // If paging is enabled we add flag value and insert page size into extraData
    if (pagingEnabled) {
        flagValue += PageSizeFlagValue
        extraData = Buffer.concat([extraData, numberToInt(BigInt(pageSize)).int])
    }

    if (hasMorePages && nextPageData != null) {
        flagValue += NextPageFlagValue
        extraData = Buffer.concat([extraData, nextPageData.bytes])
    }

    // Basic query - long string(int) + consistency(short) + flag(byte) + possible data    
    const queryBody = Buffer.from(body, 'utf-8');
    const length = BigInt(queryBody.length + 7 + extraData.length)
    setLength(buffer, length)
    buffer = addQueryBody(buffer, queryBody, consistency,  numberToByte(flagValue), Number(length), extraData)

    return buffer;
}



export default getQueryMessage;